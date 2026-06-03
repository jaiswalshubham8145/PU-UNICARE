-- =====================================================
-- Fix RLS Policies for Automation Features
-- This migration adds missing INSERT/UPDATE policies 
-- that were preventing auto-assignment from working.
-- =====================================================

-- 1. Allow authenticated users to INSERT into auto_assignment_logs
-- (auto-assignment happens client-side, so the logged-in user needs INSERT permission)
CREATE POLICY "Authenticated users can insert assignment logs" ON auto_assignment_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Allow HODs to insert into escalation_history when they acknowledge escalations
CREATE POLICY "Authenticated can insert escalation history" ON escalation_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Allow admin/HOD to update escalation history (e.g., acknowledge escalation)
CREATE POLICY "Admin/HOD can update escalation history" ON escalation_history
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hod', 'principal'))
  );

-- 4. Allow admin/HOD to view all staff skills (needed for auto-assignment candidate evaluation)
-- The existing policy only allows viewing own skills + admin managing all.
-- HODs also need to read staff skills for auto-assignment to work in their context.
CREATE POLICY "HOD can view department staff skills" ON staff_skills
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hod', 'principal'))
  );

-- 5. Allow any authenticated user to read staff_availability
-- (needed for auto-assignment scoring during complaint submission)
CREATE POLICY "Authenticated can read staff availability" ON staff_availability
  FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Allow the auto-assignment to insert/update staff_availability
-- (the workload trigger and auto-assignment engine need this)
CREATE POLICY "Authenticated can upsert own availability" ON staff_availability
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Allow HODs and Principals to view department staff roles
-- (Needed by auto-assignment engine to find candidates)
CREATE POLICY "HOD can view department user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hod', 'principal'))
  );

COMMENT ON POLICY "Authenticated users can insert assignment logs" ON auto_assignment_logs 
  IS 'Allows auto-assignment engine to log decisions from any authenticated user context';

COMMENT ON POLICY "HOD can view department user roles" ON user_roles
  IS 'Allows HODs to see who the maintenance staff are for auto-assignment';

-- 8. Automatic notification on escalation
CREATE OR REPLACE FUNCTION notify_on_escalation() RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_complaint_number TEXT;
  v_dept_id UUID;
BEGIN
  -- Get complaint details
  SELECT complaint_number, department_id INTO v_complaint_number, v_dept_id 
  FROM complaints WHERE id = NEW.complaint_id;

  -- Determine who to notify based on the new escalation level
  IF NEW.escalation_level = 1 THEN
    -- Notify HOD of the department
    SELECT user_id INTO v_user_id 
    FROM user_roles 
    WHERE department_id = v_dept_id AND role = 'hod'
    LIMIT 1;
  ELSIF NEW.escalation_level = 2 THEN
    -- Notify Principal
    SELECT user_id INTO v_user_id FROM user_roles WHERE role = 'principal' LIMIT 1;
  ELSIF NEW.escalation_level = 3 THEN
    -- Notify Admin
    SELECT user_id INTO v_user_id FROM user_roles WHERE role = 'admin' LIMIT 1;
  END IF;

  -- Insert notification if we found someone to notify
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, related_complaint_id, link)
    VALUES (
      v_user_id, 
      'sla_breach', -- Using sla_breach as it best fits an escalation event
      '🚀 Escalation: Level ' || NEW.escalation_level,
      'Complaint ' || v_complaint_number || ' has been escalated to your level for immediate attention.',
      NEW.complaint_id,
      '/dashboard/complaints/' || NEW.complaint_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_escalation ON escalation_history;
CREATE TRIGGER trigger_notify_on_escalation
  AFTER INSERT ON escalation_history
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_escalation();
