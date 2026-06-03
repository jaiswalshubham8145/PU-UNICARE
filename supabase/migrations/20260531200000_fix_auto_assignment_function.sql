-- =====================================================
-- Fix Auto-Assignment: Create SECURITY DEFINER function
-- This bypasses RLS so any authenticated user's complaint
-- submission can find the right staff/HOD/admin to assign to.
-- =====================================================

-- Function to find the best auto-assignment candidate
-- Returns user_id of the best candidate, or NULL if none found
CREATE OR REPLACE FUNCTION public.find_auto_assignment_candidate(
  _department_id UUID,
  _category_id UUID DEFAULT NULL
)
RETURNS TABLE (
  candidate_user_id UUID,
  candidate_name TEXT,
  candidate_email TEXT,
  candidate_role TEXT,
  assignment_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Try maintenance_staff in the same department with available status
  RETURN QUERY
  SELECT 
    ur.user_id,
    p.full_name,
    p.email,
    'maintenance_staff'::TEXT,
    'Auto-assigned to maintenance staff in department'::TEXT
  FROM user_roles ur
  JOIN profiles p ON p.user_id = ur.user_id
  LEFT JOIN staff_availability sa ON sa.user_id = ur.user_id
  WHERE ur.role = 'maintenance_staff'
    AND ur.department_id = _department_id
    AND (sa.status IS NULL OR sa.status IN ('available', 'busy'))
    AND (sa.current_workload IS NULL OR sa.current_workload < sa.max_workload)
  ORDER BY 
    COALESCE(sa.current_workload, 0) ASC
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- 2. Try maintenance_staff in ANY department
  RETURN QUERY
  SELECT 
    ur.user_id,
    p.full_name,
    p.email,
    'maintenance_staff'::TEXT,
    'Auto-assigned to maintenance staff (cross-department fallback)'::TEXT
  FROM user_roles ur
  JOIN profiles p ON p.user_id = ur.user_id
  LEFT JOIN staff_availability sa ON sa.user_id = ur.user_id
  WHERE ur.role = 'maintenance_staff'
    AND (sa.status IS NULL OR sa.status IN ('available', 'busy'))
    AND (sa.current_workload IS NULL OR sa.current_workload < sa.max_workload)
  ORDER BY 
    COALESCE(sa.current_workload, 0) ASC
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- 3. Try HOD of the department
  RETURN QUERY
  SELECT 
    ur.user_id,
    p.full_name,
    p.email,
    'hod'::TEXT,
    'Auto-assigned to HOD (no maintenance staff available)'::TEXT
  FROM user_roles ur
  JOIN profiles p ON p.user_id = ur.user_id
  WHERE ur.role = 'hod'
    AND ur.department_id = _department_id
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- 4. Try any HOD in the system
  RETURN QUERY
  SELECT 
    ur.user_id,
    p.full_name,
    p.email,
    'hod'::TEXT,
    'Auto-assigned to HOD (system-wide fallback)'::TEXT
  FROM user_roles ur
  JOIN profiles p ON p.user_id = ur.user_id
  WHERE ur.role = 'hod'
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- 5. Try any admin
  RETURN QUERY
  SELECT 
    ur.user_id,
    p.full_name,
    p.email,
    'admin'::TEXT,
    'Auto-assigned to Admin (ultimate fallback)'::TEXT
  FROM user_roles ur
  JOIN profiles p ON p.user_id = ur.user_id
  WHERE ur.role = 'admin'
  LIMIT 1;

  -- If nothing found, returns empty result set
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.find_auto_assignment_candidate TO authenticated;

COMMENT ON FUNCTION public.find_auto_assignment_candidate IS 
'SECURITY DEFINER function that finds the best candidate for auto-assignment of complaints.
 Bypasses RLS so any authenticated user submitting a complaint can trigger auto-assignment.
 Checks: department maintenance_staff → all maintenance_staff → department HOD → any HOD → any admin.';
