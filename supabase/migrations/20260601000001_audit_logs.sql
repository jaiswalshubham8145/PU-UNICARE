-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID, -- Can be null if system action
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'principal'))
);

-- Create generic audit trigger function
CREATE OR REPLACE FUNCTION audit_record_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Try to get current user ID from Supabase auth context
    current_user_id := auth.uid();
    
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME::TEXT, OLD.id, 'DELETE', row_to_json(OLD)::JSONB, current_user_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME::TEXT, NEW.id, 'UPDATE', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, current_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME::TEXT, NEW.id, 'INSERT', row_to_json(NEW)::JSONB, current_user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to complaints table
DROP TRIGGER IF EXISTS audit_complaints_changes ON public.complaints;
CREATE TRIGGER audit_complaints_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION audit_record_changes();

-- Attach trigger to profiles table
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION audit_record_changes();
