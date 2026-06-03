-- Migration: Audit Logging System
-- Comprehensive audit trail for all system actions

-- ============================================================
-- 1. AUDIT LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- RLS for audit logs (admin only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- 2. AUDIT LOG FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_audit(
    p_action TEXT,
    p_table_name TEXT,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id, action, table_name, record_id,
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        auth.uid(), p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- ============================================================
-- 3. TRIGGERS for Automatic Audit Logging
-- ============================================================

-- Function to log complaint changes
CREATE OR REPLACE FUNCTION public.audit_complaint_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Only log if status changed
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            PERFORM public.log_audit(
                'status_change',
                'complaints',
                NEW.id,
                jsonb_build_object('status', OLD.status, 'escalation_level', OLD.escalation_level),
                jsonb_build_object('status', NEW.status, 'escalation_level', NEW.escalation_level)
            );
        END IF;
        
        -- Log assignment changes
        IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
            PERFORM public.log_audit(
                'assignment_change',
                'complaints',
                NEW.id,
                jsonb_build_object('assigned_to', OLD.assigned_to),
                jsonb_build_object('assigned_to', NEW.assigned_to)
            );
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM public.log_audit(
            'create',
            'complaints',
            NEW.id,
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_audit(
            'delete',
            'complaints',
            OLD.id,
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Attach trigger to complaints table
DROP TRIGGER IF EXISTS audit_complaints ON public.complaints;
CREATE TRIGGER audit_complaints
    AFTER INSERT OR UPDATE OR DELETE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_complaint_changes();

-- Function to log user role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_audit(
            'role_added',
            'user_roles',
            NEW.id,
            NULL,
            jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role, 'department_id', NEW.department_id)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_audit(
            'role_removed',
            'user_roles',
            OLD.id,
            jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role, 'department_id', OLD.department_id),
            NULL
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Attach trigger to user_roles table
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
    AFTER INSERT OR DELETE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_role_changes();

-- ============================================================
-- 4. AUDIT LOG QUERY FUNCTIONS
-- ============================================================

-- Get audit logs for a specific record
CREATE OR REPLACE FUNCTION public.get_audit_logs(
    p_table_name TEXT,
    p_record_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    action TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ,
    user_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.user_id,
        al.action,
        al.old_values,
        al.new_values,
        al.created_at,
        p.full_name AS user_name
    FROM public.audit_logs al
    LEFT JOIN public.profiles p ON p.user_id = al.user_id
    WHERE al.table_name = p_table_name 
        AND al.record_id = p_record_id
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Get recent audit activity
CREATE OR REPLACE FUNCTION public.get_recent_activity(
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    user_name TEXT,
    action TEXT,
    table_name TEXT,
    record_id UUID,
    created_at TIMESTAMPTZ,
    summary TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        p.full_name AS user_name,
        al.action,
        al.table_name,
        al.record_id,
        al.created_at,
        CASE al.action
            WHEN 'create' THEN 'Created ' || al.table_name
            WHEN 'status_change' THEN 'Changed status to ' || (al.new_values->>'status')
            WHEN 'assignment_change' THEN 'Assigned to ' || (al.new_values->>'assigned_to')
            WHEN 'role_added' THEN 'Added role: ' || (al.new_values->>'role')
            WHEN 'role_removed' THEN 'Removed role: ' || (al.old_values->>'role')
            ELSE al.action || ' on ' || al.table_name
        END AS summary
    FROM public.audit_logs al
    LEFT JOIN public.profiles p ON p.user_id = al.user_id
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$$;
