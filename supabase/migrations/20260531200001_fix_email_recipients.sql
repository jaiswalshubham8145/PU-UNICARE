CREATE OR REPLACE FUNCTION get_complaint_recipients_info(
    p_department_id UUID,
    p_include_hod BOOLEAN,
    p_include_admins BOOLEAN,
    p_assignee_id UUID DEFAULT NULL,
    p_submitter_id UUID DEFAULT NULL
) RETURNS TABLE (
    email TEXT,
    full_name TEXT,
    role TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- 1. HODs
    IF p_include_hod AND p_department_id IS NOT NULL THEN
        RETURN QUERY 
        SELECT p.email, p.full_name, 'hod'::TEXT
        FROM profiles p
        JOIN user_roles ur ON p.user_id = ur.user_id
        WHERE ur.role = 'hod' AND ur.department_id = p_department_id AND p.email IS NOT NULL;
    END IF;

    -- 2. Admins
    IF p_include_admins THEN
        RETURN QUERY 
        SELECT p.email, p.full_name, 'admin'::TEXT
        FROM profiles p
        JOIN user_roles ur ON p.user_id = ur.user_id
        WHERE ur.role = 'admin' AND p.email IS NOT NULL;
    END IF;

    -- 3. Assignee
    IF p_assignee_id IS NOT NULL THEN
        RETURN QUERY 
        SELECT p.email, p.full_name, 'assignee'::TEXT
        FROM profiles p
        WHERE p.user_id = p_assignee_id AND p.email IS NOT NULL;
    END IF;

    -- 4. Submitter
    IF p_submitter_id IS NOT NULL THEN
        RETURN QUERY 
        SELECT p.email, p.full_name, 'submitter'::TEXT
        FROM profiles p
        WHERE p.user_id = p_submitter_id AND p.email IS NOT NULL;
    END IF;
END;
$$;
