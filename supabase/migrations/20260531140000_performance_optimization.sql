-- Migration: Performance Optimization - Composite Indexes, Views, and Stored Procedures
-- This migration adds performance optimizations for the PU UNICARE system

-- ============================================================
-- 1. COMPOSITE INDEXES for Common Query Patterns
-- ============================================================

-- Complaints: Most queries filter by status + department
CREATE INDEX IF NOT EXISTS idx_complaints_status_department 
ON public.complaints(status, department_id);

-- Complaints: Query by submitter + status
CREATE INDEX IF NOT EXISTS idx_complaints_submitter_status 
ON public.complaints(submitted_by, status);

-- Complaints: Query by assignee + status
CREATE INDEX IF NOT EXISTS idx_complaints_assignee_status 
ON public.complaints(assigned_to, status);

-- Complaints: Escalation queries
CREATE INDEX IF NOT EXISTS idx_complaints_escalation 
ON public.complaints(escalation_level, status, created_at);

-- Complaints: SLA breach detection
CREATE INDEX IF NOT EXISTS idx_complaints_sla 
ON public.complaints(status, created_at) WHERE status IN ('pending', 'acknowledged', 'approved');

-- Complaints: Full-text search optimization
CREATE INDEX IF NOT EXISTS idx_complaints_search 
ON public.complaints USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Complaint updates: Query by complaint_id + created_at
CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint_date 
ON public.complaint_updates(complaint_id, created_at DESC);

-- Notifications: User notifications query
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications(user_id, is_read, created_at DESC);

-- SLA tracking: Breach detection
CREATE INDEX IF NOT EXISTS idx_sla_tracking_breach 
ON public.sla_tracking(is_response_breached, is_resolution_breached, escalation_due_at);

-- Escalation history: Query by complaint
CREATE INDEX IF NOT EXISTS idx_escalation_history_complaint 
ON public.escalation_history(complaint_id, escalation_level DESC);

-- Auto assignment logs: Query by complaint
CREATE INDEX IF NOT EXISTS idx_auto_assignment_logs_complaint 
ON public.auto_assignment_logs(complaint_id, created_at DESC);

-- Staff availability: Query by status
CREATE INDEX IF NOT EXISTS idx_staff_availability_status 
ON public.staff_availability(status, is_on_duty);

-- Staff skills: Query by category
CREATE INDEX IF NOT EXISTS idx_staff_skills_category 
ON public.staff_skills(category_id, proficiency_level DESC);

-- Complaint ratings: Query by complaint
CREATE INDEX IF NOT EXISTS idx_complaint_ratings_complaint 
ON public.complaint_ratings(complaint_id);

-- User roles: Query by role + department
CREATE INDEX IF NOT EXISTS idx_user_roles_role_dept 
ON public.user_roles(role, department_id);

-- ============================================================
-- 2. ANALYTICS VIEWS
-- ============================================================

-- Department Performance View
CREATE OR REPLACE VIEW public.v_department_analytics AS
SELECT 
    d.id AS department_id,
    d.name AS department_name,
    COUNT(c.id) AS total_complaints,
    COUNT(c.id) FILTER (WHERE c.status = 'pending') AS pending_count,
    COUNT(c.id) FILTER (WHERE c.status = 'in_progress') AS in_progress_count,
    COUNT(c.id) FILTER (WHERE c.status = 'completed') AS completed_count,
    COUNT(c.id) FILTER (WHERE c.status = 'closed') AS closed_count,
    COUNT(c.id) FILTER (WHERE c.escalation_level > 0) AS escalated_count,
    ROUND(
        CASE 
            WHEN COUNT(c.id) > 0 
            THEN (COUNT(c.id) FILTER (WHERE c.status IN ('completed', 'closed'))::numeric / COUNT(c.id) * 100)
            ELSE 0 
        END, 1
    ) AS resolution_rate,
    ROUND(AVG(
        CASE 
            WHEN c.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600
        END
    ), 1) AS avg_resolution_hours
FROM public.departments d
LEFT JOIN public.complaints c ON c.department_id = d.id
GROUP BY d.id, d.name;

-- Category Analytics View
CREATE OR REPLACE VIEW public.v_category_analytics AS
SELECT 
    mc.id AS category_id,
    mc.name AS category_name,
    COUNT(c.id) AS total_complaints,
    COUNT(c.id) FILTER (WHERE c.status = 'pending') AS pending_count,
    COUNT(c.id) FILTER (WHERE c.status = 'completed') AS completed_count,
    ROUND(AVG(
        CASE 
            WHEN c.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600
        END
    ), 1) AS avg_resolution_hours,
    COUNT(c.id) FILTER (WHERE c.priority = 'critical') AS critical_count,
    COUNT(c.id) FILTER (WHERE c.priority = 'high') AS high_count
FROM public.maintenance_categories mc
LEFT JOIN public.complaints c ON c.category_id = mc.id
GROUP BY mc.id, mc.name;

-- SLA Compliance View
CREATE OR REPLACE VIEW public.v_sla_compliance AS
SELECT 
    st.complaint_id,
    c.complaint_number,
    c.title,
    c.priority,
    c.status,
    st.response_due_at,
    st.resolution_due_at,
    st.escalation_due_at,
    st.is_response_breached,
    st.is_resolution_breached,
    st.resolved_at,
    CASE 
        WHEN st.is_response_breached THEN 'Response Breached'
        WHEN st.is_resolution_breached THEN 'Resolution Breached'
        WHEN st.escalation_due_at < now() AND c.status NOT IN ('completed', 'closed') THEN 'Escalation Due'
        ELSE 'On Track'
    END AS sla_status,
    CASE 
        WHEN st.resolved_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (st.resolved_at - c.created_at)) / 3600
        ELSE
            EXTRACT(EPOCH FROM (now() - c.created_at)) / 3600
    END AS hours_elapsed
FROM public.sla_tracking st
JOIN public.complaints c ON c.id = st.complaint_id;

-- Staff Performance View
CREATE OR REPLACE VIEW public.v_staff_performance AS
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    COUNT(c.id) AS total_assigned,
    COUNT(c.id) FILTER (WHERE c.status IN ('completed', 'closed')) AS completed_count,
    ROUND(
        CASE 
            WHEN COUNT(c.id) > 0 
            THEN (COUNT(c.id) FILTER (WHERE c.status IN ('completed', 'closed'))::numeric / COUNT(c.id) * 100)
            ELSE 0 
        END, 1
    ) AS completion_rate,
    ROUND(AVG(cr.rating), 1) AS avg_rating,
    ROUND(AVG(
        CASE 
            WHEN c.resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600
        END
    ), 1) AS avg_resolution_hours
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.user_id AND ur.role = 'maintenance_staff'
LEFT JOIN public.complaints c ON c.assigned_to = p.user_id
LEFT JOIN public.complaint_ratings cr ON cr.complaint_id = c.id
GROUP BY p.user_id, p.full_name, p.email;

-- ============================================================
-- 3. STORED PROCEDURES
-- ============================================================

-- Get complaint statistics for a role
CREATE OR REPLACE FUNCTION public.get_complaint_stats(
    p_user_id UUID DEFAULT NULL,
    p_role TEXT DEFAULT NULL,
    p_department_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total BIGINT,
    pending BIGINT,
    in_progress BIGINT,
    completed BIGINT,
    escalated BIGINT,
    avg_resolution_hours NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(c.id)::BIGINT AS total,
        COUNT(c.id) FILTER (WHERE c.status = 'pending')::BIGINT AS pending,
        COUNT(c.id) FILTER (WHERE c.status = 'in_progress')::BIGINT AS in_progress,
        COUNT(c.id) FILTER (WHERE c.status IN ('completed', 'closed'))::BIGINT AS completed,
        COUNT(c.id) FILTER (WHERE c.escalation_level > 0)::BIGINT AS escalated,
        ROUND(AVG(
            CASE 
                WHEN c.resolved_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600
            END
        ), 1) AS avg_resolution_hours
    FROM public.complaints c
    WHERE 
        (p_user_id IS NULL OR c.submitted_by = p_user_id OR c.assigned_to = p_user_id)
        AND (p_department_id IS NULL OR c.department_id = p_department_id)
        AND (p_role IS NULL OR p_role = 'admin' OR 
             (p_role = 'hod' AND c.department_id = p_department_id) OR
             (p_role = 'maintenance_staff' AND c.assigned_to = p_user_id));
END;
$$;

-- Bulk update complaint status
CREATE OR REPLACE FUNCTION public.bulk_update_status(
    p_complaint_ids UUID[],
    p_new_status TEXT,
    p_updated_by UUID,
    p_note TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
    v_id UUID;
BEGIN
    FOREACH v_id IN ARRAY p_complaint_ids
    LOOP
        UPDATE public.complaints 
        SET status = p_new_status, updated_at = now()
        WHERE id = v_id;
        
        INSERT INTO public.complaint_updates (complaint_id, status, updated_by, note)
        VALUES (v_id, p_new_status, p_updated_by, p_note || ' (Bulk update)');
        
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$;

-- Get escalation candidates
CREATE OR REPLACE FUNCTION public.get_escalation_candidates()
RETURNS TABLE (
    complaint_id UUID,
    complaint_number TEXT,
    title TEXT,
    current_level INTEGER,
    hours_pending NUMERIC,
    should_escalate_to TEXT,
    department_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS complaint_id,
        c.complaint_number,
        c.title,
        c.escalation_level AS current_level,
        ROUND(EXTRACT(EPOCH FROM (now() - c.created_at)) / 3600, 1) AS hours_pending,
        CASE 
            WHEN c.escalation_level = 0 THEN 'hod'
            WHEN c.escalation_level = 1 THEN 'principal'
            WHEN c.escalation_level = 2 THEN 'admin'
        END AS should_escalate_to,
        d.name AS department_name
    FROM public.complaints c
    JOIN public.departments d ON d.id = c.department_id
    JOIN public.escalation_rules er ON er.is_active = true
        AND (er.department_id IS NULL OR er.department_id = c.department_id)
        AND (er.category_id IS NULL OR er.category_id = c.category_id)
    WHERE c.status IN ('pending', 'acknowledged', 'approved')
        AND c.escalation_level < 3
        AND EXTRACT(EPOCH FROM (now() - c.created_at)) / 3600 >= er.escalate_after_hours
        AND er.level = c.escalation_level + 1;
END;
$$;

-- Cleanup old data
CREATE OR REPLACE FUNCTION public.cleanup_old_data(
    p_days_to_keep INTEGER DEFAULT 365
)
RETURNS TABLE (
    table_name TEXT,
    rows_deleted BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cutoff_date TIMESTAMPTZ := now() - (p_days_to_keep || ' days')::INTERVAL;
    v_count BIGINT;
BEGIN
    -- Cleanup old notifications
    DELETE FROM public.notifications WHERE created_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'notifications';
    rows_deleted := v_count;
    RETURN NEXT;

    -- Cleanup old complaint updates for closed complaints
    DELETE FROM public.complaint_updates 
    WHERE complaint_id IN (
        SELECT id FROM public.complaints 
        WHERE status IN ('completed', 'closed') 
        AND resolved_at < v_cutoff_date
    );
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'complaint_updates';
    rows_deleted := v_count;
    RETURN NEXT;

    -- Cleanup old escalation history
    DELETE FROM public.escalation_history WHERE escalated_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'escalation_history';
    rows_deleted := v_count;
    RETURN NEXT;
END;
$$;

-- ============================================================
-- 4. MATERIALIZED VIEW for Dashboard Performance
-- ============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.complaints)::BIGINT AS total_complaints,
    (SELECT COUNT(*) FROM public.complaints WHERE status = 'pending')::BIGINT AS pending_complaints,
    (SELECT COUNT(*) FROM public.complaints WHERE status = 'in_progress')::BIGINT AS in_progress_complaints,
    (SELECT COUNT(*) FROM public.complaints WHERE status IN ('completed', 'closed'))::BIGINT AS completed_complaints,
    (SELECT COUNT(*) FROM public.complaints WHERE escalation_level > 0)::BIGINT AS escalated_complaints,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'maintenance_staff')::BIGINT AS total_staff,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'faculty')::BIGINT AS total_faculty,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'hod')::BIGINT AS total_hods,
    now() AS last_refreshed;

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_dashboard_stats;
END;
$$;

-- Schedule refresh every 5 minutes (requires pg_cron)
-- SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', 'SELECT refresh_dashboard_stats()');
