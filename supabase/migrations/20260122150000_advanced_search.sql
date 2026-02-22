-- =====================================================
-- Phase 2, Feature 1: Advanced Search & Filters
-- =====================================================

-- 1. ADD FULL-TEXT SEARCH VECTOR COLUMN
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. CREATE FUNCTION TO UPDATE SEARCH VECTOR
CREATE OR REPLACE FUNCTION public.update_complaint_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.complaint_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$;

-- 3. CREATE TRIGGER FOR AUTO-UPDATE
DROP TRIGGER IF EXISTS trigger_update_complaint_search ON public.complaints;
CREATE TRIGGER trigger_update_complaint_search
  BEFORE INSERT OR UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_complaint_search_vector();

-- 4. CREATE GIN INDEX FOR FAST SEARCH
CREATE INDEX IF NOT EXISTS idx_complaints_search ON public.complaints USING GIN(search_vector);

-- 5. UPDATE EXISTING ROWS (Populate search_vector for old data)
UPDATE public.complaints SET 
  search_vector = 
    setweight(to_tsvector('english', COALESCE(complaint_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(location, '')), 'C')
WHERE search_vector IS NULL;

-- 6. SAVED SEARCHES TABLE
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL, -- Stores all filter criteria
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  CREATE POLICY "Users manage own saved searches" ON public.saved_searches
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);

-- 7. SEARCH HISTORY TABLE (Recent searches)
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  filters JSONB,
  result_count INT,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  CREATE POLICY "Users view own search history" ON public.search_history
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id, searched_at DESC);

-- 8. ADVANCED SEARCH FUNCTION
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
  sla_status TEXT DEFAULT NULL, -- 'on_track', 'breached', 'warning'
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
SECURITY DEFINER
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
    -- Text search
    (search_query IS NULL OR search_query = '' OR c.search_vector @@ plainto_tsquery('english', search_query))
    -- Status filter
    AND (status_filter IS NULL OR c.status = ANY(status_filter))
    -- Priority filter
    AND (priority_filter IS NULL OR c.priority = ANY(priority_filter))
    -- Category filter
    AND (category_ids IS NULL OR c.category_id = ANY(category_ids))
    -- Department filter
    AND (department_ids IS NULL OR c.department_id = ANY(department_ids))
    -- Building filter
    AND (building_ids IS NULL OR c.building_id = ANY(building_ids))
    -- Assigned to
    AND (assigned_to_filter IS NULL OR c.assigned_to = assigned_to_filter)
    -- Submitted by
    AND (submitted_by_filter IS NULL OR c.submitted_by = submitted_by_filter)
    -- Date range
    AND (date_from IS NULL OR c.created_at >= date_from)
    AND (date_to IS NULL OR c.created_at <= date_to)
    -- SLA status
    AND (sla_status IS NULL OR 
         (sla_status = 'breached' AND st.is_resolution_breached = true) OR
         (sla_status = 'on_track' AND (st.is_resolution_breached = false OR st.is_resolution_breached IS NULL)))
    -- Rating range
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
