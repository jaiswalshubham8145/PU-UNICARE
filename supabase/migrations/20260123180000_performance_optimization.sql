-- =====================================================
-- Performance Optimization & Indexes
-- =====================================================

-- 1. Ensure required columns exist
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS is_sla_breached BOOLEAN DEFAULT false;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- 2. Add composite indexes for frequently queried combinations
CREATE INDEX IF NOT EXISTS idx_complaints_status_priority ON public.complaints(status, priority);
CREATE INDEX IF NOT EXISTS idx_complaints_dept_status ON public.complaints(department_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_status ON public.complaints(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_status ON public.complaints(assigned_to, status) WHERE assigned_to IS NOT NULL;

-- 2. Add index for SLA queries
CREATE INDEX IF NOT EXISTS idx_complaints_sla_breach ON public.complaints(is_sla_breached, status) WHERE is_sla_breached = true AND status NOT IN ('completed', 'closed');

-- 3. Optimize complaint_updates table
CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint_created ON public.complaint_updates(complaint_id, created_at DESC);

-- 4. Optimize full-text search
CREATE INDEX IF NOT EXISTS idx_complaints_fulltext ON public.complaints USING gin(to_tsvector('english', title || ' ' || description || ' ' || location));

-- 5. Add materialized view for dashboard stats (faster queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
    COUNT(*) as total_complaints,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
    COUNT(*) FILTER (WHERE status IN ('completed', 'closed')) as completed,
    COUNT(*) FILTER (WHERE is_sla_breached = true) as sla_breached,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_hours
FROM public.complaints;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_stats_unique ON dashboard_stats ((1));

-- 6. Function to refresh dashboard stats (call this periodically via cron)
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$;

-- 7. Add partitioning for very large tables (future-proofing)
-- This splits the complaints table by year for better performance at scale
-- Uncomment when you hit 100k+ complaints

-- CREATE TABLE public.complaints_2024 PARTITION OF public.complaints
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- CREATE TABLE public.complaints_2025 PARTITION OF public.complaints
-- FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- 8. Optimize user_roles lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);

-- 9. Add database-level constraints for data integrity
ALTER TABLE public.complaints
  ADD CONSTRAINT chk_status CHECK (status IN ('pending', 'acknowledged', 'approved', 'in_progress', 'on_hold', 'completed', 'rejected', 'closed'));

ALTER TABLE public.complaints
  ADD CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- 10. Create function to auto-archive old complaints (e.g., older than 2 years)
CREATE TABLE IF NOT EXISTS public.complaints_archive (LIKE public.complaints INCLUDING ALL);

CREATE OR REPLACE FUNCTION archive_old_complaints()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    WITH moved AS (
        DELETE FROM public.complaints
        WHERE created_at < NOW() - INTERVAL '2 years'
          AND status IN ('completed', 'closed')
        RETURNING *
    )
    INSERT INTO public.complaints_archive
    SELECT * FROM moved;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$;

-- Performance Analysis: Run ANALYZE to update statistics
ANALYZE public.complaints;
ANALYZE public.complaint_updates;
ANALYZE public.user_roles;

COMMENT ON MATERIALIZED VIEW dashboard_stats IS 'Cached dashboard statistics, refresh every 5 minutes via cron job';
COMMENT ON FUNCTION archive_old_complaints IS 'Archives complaints older than 2 years to separate table';
