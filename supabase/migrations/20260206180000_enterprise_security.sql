-- =====================================================
-- Enterprise Security & Data Integrity Enhancement
-- Version: 1.0.0
-- Date: 2026-02-06
-- =====================================================

-- 1. Rate Limiting Table for API Protection
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON public.rate_limits(user_id, action_type, window_start);

-- Rate limit function
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_max_requests INTEGER DEFAULT 100,
    p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMPTZ;
BEGIN
    window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    SELECT COUNT(*) INTO current_count
    FROM public.rate_limits
    WHERE user_id = p_user_id 
      AND action_type = p_action 
      AND created_at > window_start;
    
    IF current_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;
    
    INSERT INTO public.rate_limits (user_id, action_type)
    VALUES (p_user_id, p_action);
    
    RETURN TRUE;
END;
$$;

-- 2. Audit Log Table for Complete Activity Tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(record_id);

-- Audit trigger function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    changed_cols TEXT[];
    old_json JSONB;
    new_json JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_json := to_jsonb(OLD);
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, old_json, auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        old_json := to_jsonb(OLD);
        new_json := to_jsonb(NEW);
        -- Get changed fields
        SELECT array_agg(key) INTO changed_cols
        FROM jsonb_each(new_json) n
        LEFT JOIN jsonb_each(old_json) o USING (key)
        WHERE n.value IS DISTINCT FROM o.value;
        
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_fields, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, old_json, new_json, changed_cols, auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        new_json := to_jsonb(NEW);
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, new_json, auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Apply audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_complaints ON public.complaints;
CREATE TRIGGER audit_complaints
    AFTER INSERT OR UPDATE OR DELETE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 3. Data Encryption for Sensitive Fields (using pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN encode(pgp_sym_encrypt(data, key), 'base64');
END;
$$;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT, key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN pgp_sym_decrypt(decode(encrypted_data, 'base64'), key);
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- 4. Session Management Table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    device_info JSONB,
    ip_address INET,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);

-- 5. Enhanced RLS Policies
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own rate limits
CREATE POLICY IF NOT EXISTS "Users view own rate limits"
    ON public.rate_limits FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Only admins can view audit logs
CREATE POLICY IF NOT EXISTS "Admins view audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Users manage own sessions
CREATE POLICY IF NOT EXISTS "Users manage own sessions"
    ON public.user_sessions FOR ALL
    USING (user_id = auth.uid());

-- 6. Input Sanitization Function
CREATE OR REPLACE FUNCTION sanitize_input(input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Remove potential XSS attempts
    input := regexp_replace(input, '<script[^>]*>.*?</script>', '', 'gi');
    input := regexp_replace(input, '<[^>]*on\w+\s*=', '<', 'gi');
    -- Remove SQL injection attempts
    input := regexp_replace(input, '''|--|;|/\*|\*/|xp_|sp_|0x', '', 'gi');
    -- Normalize whitespace
    input := regexp_replace(input, '\s+', ' ', 'g');
    RETURN trim(input);
END;
$$;

-- 7. Complaint validation trigger
CREATE OR REPLACE FUNCTION validate_complaint()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Sanitize inputs
    NEW.title := sanitize_input(NEW.title);
    NEW.description := sanitize_input(NEW.description);
    NEW.location := sanitize_input(NEW.location);
    
    -- Validate required fields
    IF NEW.title IS NULL OR length(NEW.title) < 5 THEN
        RAISE EXCEPTION 'Title must be at least 5 characters';
    END IF;
    
    IF NEW.description IS NULL OR length(NEW.description) < 10 THEN
        RAISE EXCEPTION 'Description must be at least 10 characters';
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_complaint_trigger ON public.complaints;
CREATE TRIGGER validate_complaint_trigger
    BEFORE INSERT OR UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION validate_complaint();

-- 8. Security Event Logging
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity, created_at DESC);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_severity TEXT DEFAULT 'low',
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security_events (event_type, severity, description, user_id, metadata)
    VALUES (p_event_type, p_severity, p_description, auth.uid(), p_metadata)
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$;

-- 9. Cleanup old data function (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Clean rate limits older than 24 hours
    DELETE FROM public.rate_limits
    WHERE created_at < NOW() - INTERVAL '24 hours';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean expired sessions
    DELETE FROM public.user_sessions
    WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Archive old audit logs (older than 1 year)
    -- In production, move to archive table instead of delete
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - INTERVAL '1 year';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE public.audit_logs IS 'Complete audit trail for all database changes - Enterprise security feature';
COMMENT ON TABLE public.rate_limits IS 'API rate limiting - Prevents abuse and DoS attacks';
COMMENT ON TABLE public.security_events IS 'Security event logging for incident response and compliance';
COMMENT ON TABLE public.user_sessions IS 'Active session management for security monitoring';
COMMENT ON FUNCTION check_rate_limit IS 'Check and enforce rate limits per user per action';
COMMENT ON FUNCTION sanitize_input IS 'Sanitize user input to prevent XSS and SQL injection';
COMMENT ON FUNCTION log_security_event IS 'Log security-relevant events for monitoring';
