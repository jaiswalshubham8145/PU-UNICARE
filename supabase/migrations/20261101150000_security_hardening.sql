-- =====================================================
-- Migration: 20261101150000_security_hardening.sql
-- Application Security Hardening for PU UNICARE
-- Addresses:
--   1. Privilege Escalation Prevention on Signup
--   2. Insecure Direct Object Reference (submitted_by) on Complaints
--   3. Secure Recipient Telemetry RPC (Information Disclosure fix)
--   4. RLS Enforcement on Advanced Search Function (SECURITY INVOKER)
--   5. Server-side Domain Validation on Profiles
-- =====================================================

-- 1. PREVENT PRIVILEGE ESCALATION VIA RAW_USER_META_DATA
-- Only 'student' or 'faculty' self-registration is allowed.
-- 'admin', 'principal', 'hod', and 'maintenance_staff' roles must be assigned by authorized staff.
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT := NEW.raw_user_meta_data ->> 'role';
  assigned_role app_role := 'student';
BEGIN
  IF requested_role = 'faculty' THEN
    assigned_role := 'faculty';
  ELSE
    assigned_role := 'student';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = assigned_role
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, assigned_role);
  END IF;

  RETURN NEW;
END;
$$;

-- 2. PREVENT IDENTITY SPOOFING IN COMPLAINT SUBMISSION
-- Enforce that submitted_by matches the caller's authenticated user ID.
DROP POLICY IF EXISTS "Authenticated users can submit complaints" ON public.complaints;
CREATE POLICY "Authenticated users can submit complaints" ON public.complaints
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND submitted_by = auth.uid()
  );

-- 3. SECURE RECIPIENTS RPC TO PREVENT USER / ADMIN ENUMERATION
CREATE OR REPLACE FUNCTION public.get_complaint_recipients_info(
    p_department_id UUID,
    p_include_hod BOOLEAN,
    p_include_admins BOOLEAN,
    p_assignee_id UUID DEFAULT NULL,
    p_submitter_id UUID DEFAULT NULL
) RETURNS TABLE (
    email TEXT,
    full_name TEXT,
    role TEXT
) LANGUAGE plpgsql SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    -- Require active authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required to access recipient telemetry';
    END IF;

    -- 1. HODs (Restricted to department scope)
    IF p_include_hod AND p_department_id IS NOT NULL THEN
        RETURN QUERY 
        SELECT p.email, p.full_name, 'hod'::TEXT
        FROM public.profiles p
        JOIN public.user_roles ur ON p.user_id = ur.user_id
        WHERE ur.role = 'hod' 
          AND ur.department_id = p_department_id 
          AND p.email IS NOT NULL;
    END IF;

    -- 2. Admins (Only visible to authenticated staff, HODs, principals, or admins)
    IF p_include_admins THEN
        IF public.has_role(auth.uid(), 'admin') 
           OR public.has_role(auth.uid(), 'principal') 
           OR public.has_role(auth.uid(), 'hod') 
           OR public.has_role(auth.uid(), 'maintenance_staff') THEN
            RETURN QUERY 
            SELECT p.email, p.full_name, 'admin'::TEXT
            FROM public.profiles p
            JOIN public.user_roles ur ON p.user_id = ur.user_id
            WHERE ur.role = 'admin' AND p.email IS NOT NULL;
        END IF;
    END IF;

    -- 3. Assignee
    IF p_assignee_id IS NOT NULL THEN
        RETURN QUERY 
        SELECT p.email, p.full_name, 'assignee'::TEXT
        FROM public.profiles p
        WHERE p.user_id = p_assignee_id AND p.email IS NOT NULL;
    END IF;

    -- 4. Submitter
    IF p_submitter_id IS NOT NULL THEN
        RETURN QUERY 
        SELECT p.email, p.full_name, 'submitter'::TEXT
        FROM public.profiles p
        WHERE p.user_id = p_submitter_id AND p.email IS NOT NULL;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.get_complaint_recipients_info(UUID, BOOLEAN, BOOLEAN, UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_complaint_recipients_info(UUID, BOOLEAN, BOOLEAN, UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_complaint_recipients_info(UUID, BOOLEAN, BOOLEAN, UUID, UUID) TO authenticated;

-- 4. FIX ADVANCED SEARCH RLS BYPASS (CHANGE TO SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.search_complaints(
  search_query TEXT DEFAULT NULL,
  status_filter complaint_status[] DEFAULT NULL,
  priority_filter complaint_priority[] DEFAULT NULL,
  category_ids UUID[] DEFAULT NULL,
  department_ids UUID[] DEFAULT NULL,
  building_ids UUID[] DEFAULT NULL,
  assigned_to_filter UUID DEFAULT NULL,
  submitted_by_filter UUID DEFAULT NULL,
  date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  sla_status TEXT DEFAULT NULL,
  rating_min INT DEFAULT NULL,
  rating_max INT DEFAULT NULL,
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  complaint_number TEXT,
  title TEXT,
  description TEXT,
  status complaint_status,
  priority complaint_priority,
  created_at TIMESTAMP WITH TIME ZONE,
  category_name TEXT,
  department_name TEXT,
  building_name TEXT,
  submitted_by_name TEXT,
  assigned_to_name TEXT,
  rating INT,
  is_sla_breached BOOLEAN,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER -- Enforces caller RLS policies
SET search_path = public
AS $$
DECLARE
  total BIGINT;
BEGIN
  -- Get total count first
  SELECT COUNT(*) INTO total
  FROM public.complaints c
  LEFT JOIN public.sla_tracking st ON c.id = st.complaint_id
  LEFT JOIN public.complaint_ratings cr ON c.id = cr.complaint_id
  WHERE 
    (search_query IS NULL OR search_query = '' OR c.search_vector @@ plainto_tsquery('english', search_query))
    AND (status_filter IS NULL OR c.status = ANY(status_filter))
    AND (priority_filter IS NULL OR c.priority = ANY(priority_filter))
    AND (category_ids IS NULL OR c.category_id = ANY(category_ids))
    AND (department_ids IS NULL OR c.department_id = ANY(department_ids))
    AND (building_ids IS NULL OR c.building_id = ANY(building_ids))
    AND (assigned_to_filter IS NULL OR c.assigned_to = assigned_to_filter)
    AND (submitted_by_filter IS NULL OR c.submitted_by = submitted_by_filter)
    AND (date_from IS NULL OR c.created_at >= date_from)
    AND (date_to IS NULL OR c.created_at <= date_to)
    AND (sla_status IS NULL OR 
         (sla_status = 'breached' AND st.is_resolution_breached = true) OR
         (sla_status = 'on_track' AND (st.is_resolution_breached = false OR st.is_resolution_breached IS NULL)))
    AND (rating_min IS NULL OR cr.rating >= rating_min)
    AND (rating_max IS NULL OR cr.rating <= rating_max);

  -- Return paginated results
  RETURN QUERY
  SELECT 
    c.id,
    c.complaint_number,
    c.title,
    c.description,
    c.status,
    c.priority,
    c.created_at,
    mc.name AS category_name,
    d.name AS department_name,
    b.name AS building_name,
    p_sub.full_name AS submitted_by_name,
    p_assign.full_name AS assigned_to_name,
    cr.rating,
    COALESCE(st.is_resolution_breached, false) AS is_sla_breached,
    total AS total_count
  FROM public.complaints c
  LEFT JOIN public.maintenance_categories mc ON c.category_id = mc.id
  LEFT JOIN public.departments d ON c.department_id = d.id
  LEFT JOIN public.buildings b ON c.building_id = b.id
  LEFT JOIN public.profiles p_sub ON c.submitted_by = p_sub.id
  LEFT JOIN public.profiles p_assign ON c.assigned_to = p_assign.id
  LEFT JOIN public.sla_tracking st ON c.id = st.complaint_id
  LEFT JOIN public.complaint_ratings cr ON c.id = cr.complaint_id
  WHERE 
    (search_query IS NULL OR search_query = '' OR c.search_vector @@ plainto_tsquery('english', search_query))
    AND (status_filter IS NULL OR c.status = ANY(status_filter))
    AND (priority_filter IS NULL OR c.priority = ANY(priority_filter))
    AND (category_ids IS NULL OR c.category_id = ANY(category_ids))
    AND (department_ids IS NULL OR c.department_id = ANY(department_ids))
    AND (building_ids IS NULL OR c.building_id = ANY(building_ids))
    AND (assigned_to_filter IS NULL OR c.assigned_to = assigned_to_filter)
    AND (submitted_by_filter IS NULL OR c.submitted_by = submitted_by_filter)
    AND (date_from IS NULL OR c.created_at >= date_from)
    AND (date_to IS NULL OR c.created_at <= date_to)
    AND (sla_status IS NULL OR 
         (sla_status = 'breached' AND st.is_resolution_breached = true) OR
         (sla_status = 'on_track' AND (st.is_resolution_breached = false OR st.is_resolution_breached IS NULL)))
    AND (rating_min IS NULL OR cr.rating >= rating_min)
    AND (rating_max IS NULL OR cr.rating <= rating_max)
  ORDER BY 
    CASE WHEN search_query IS NOT NULL AND search_query != '' 
         THEN ts_rank(c.search_vector, plainto_tsquery('english', search_query)) 
         ELSE 0 END DESC,
    c.created_at DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$;

-- 5. SERVER-SIDE UNIVERSITY EMAIL DOMAIN VALIDATION
CREATE OR REPLACE FUNCTION public.validate_university_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email NOT LIKE '%@paruluniversity.ac.in' AND NEW.email NOT LIKE '%@pu.edu' THEN
    RAISE EXCEPTION 'Registration restricted to verified Parul University email domains (@paruluniversity.ac.in / @pu.edu)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_university_email ON public.profiles;
CREATE TRIGGER trg_validate_university_email
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_university_email();
