-- =====================================================
-- Phase 2: Advanced Automation & Smart Features
-- Migration for PU Unicare Advanced Maintenance System
-- =====================================================

-- =====================================================
-- 1. ESCALATION RULES TABLE
-- Auto-escalate complaints when unattended
-- =====================================================

CREATE TABLE IF NOT EXISTS escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES maintenance_categories(id) ON DELETE CASCADE,
  level INT NOT NULL DEFAULT 1, -- 1 = First escalation, 2 = Second, 3 = Final
  escalate_after_hours INT NOT NULL DEFAULT 24, -- Hours before escalation
  escalate_to_role TEXT NOT NULL CHECK (escalate_to_role IN ('hod', 'principal', 'admin')),
  notify_via TEXT[] DEFAULT ARRAY['email', 'push', 'in_app'],
  notify_original_assignee BOOLEAN DEFAULT true,
  notify_submitter BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, category_id, level)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_escalation_rules_active ON escalation_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_escalation_rules_dept ON escalation_rules(department_id);

-- =====================================================
-- 2. ESCALATION TRACKING TABLE
-- Track escalation history for each complaint
-- =====================================================

CREATE TABLE IF NOT EXISTS escalation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  escalation_rule_id UUID REFERENCES escalation_rules(id),
  escalated_from_user_id UUID REFERENCES auth.users(id),
  escalated_to_user_id UUID REFERENCES auth.users(id),
  escalation_level INT NOT NULL DEFAULT 1,
  reason TEXT DEFAULT 'No response within SLA',
  escalated_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  UNIQUE(complaint_id, escalation_level)
);

CREATE INDEX IF NOT EXISTS idx_escalation_history_complaint ON escalation_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_escalation_history_pending ON escalation_history(acknowledged_at) WHERE acknowledged_at IS NULL;

-- =====================================================
-- 3. STAFF SKILLS TABLE
-- Track maintenance staff skills for auto-assignment
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES maintenance_categories(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level INT DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5), -- 1=Beginner, 5=Expert
  is_primary BOOLEAN DEFAULT false,
  years_experience DECIMAL(4,1) DEFAULT 0,
  certifications TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_staff_skills_user ON staff_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_skills_category ON staff_skills(category_id);
CREATE INDEX IF NOT EXISTS idx_staff_skills_proficiency ON staff_skills(proficiency_level DESC);

-- =====================================================
-- 4. STAFF AVAILABILITY TABLE
-- Real-time staff availability status
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'on_leave', 'offline')),
  current_workload INT DEFAULT 0, -- Number of active assignments
  max_workload INT DEFAULT 5, -- Maximum concurrent assignments
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  shift_start TIME,
  shift_end TIME,
  is_on_duty BOOLEAN DEFAULT true,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_availability_status ON staff_availability(status) WHERE status = 'available';
CREATE INDEX IF NOT EXISTS idx_staff_availability_workload ON staff_availability(current_workload);

-- =====================================================
-- 5. STAFF SHIFTS TABLE
-- Manage staff schedules and rosters
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  shift_type TEXT DEFAULT 'regular' CHECK (shift_type IN ('regular', 'overtime', 'on_call')),
  is_leave BOOLEAN DEFAULT false,
  leave_type TEXT CHECK (leave_type IN ('sick', 'casual', 'vacation', 'emergency')),
  backup_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, shift_date)
);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_date ON staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_user ON staff_shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_leave ON staff_shifts(is_leave) WHERE is_leave = true;

-- =====================================================
-- 6. DIGEST PREFERENCES TABLE
-- Configure email digest settings per user
-- =====================================================

CREATE TABLE IF NOT EXISTS digest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  morning_digest_enabled BOOLEAN DEFAULT true,
  morning_digest_time TIME DEFAULT '08:00',
  evening_digest_enabled BOOLEAN DEFAULT true,
  evening_digest_time TIME DEFAULT '18:00',
  weekly_report_enabled BOOLEAN DEFAULT true,
  weekly_report_day INT DEFAULT 1 CHECK (weekly_report_day BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
  include_pending_complaints BOOLEAN DEFAULT true,
  include_escalated_complaints BOOLEAN DEFAULT true,
  include_sla_breaches BOOLEAN DEFAULT true,
  include_performance_metrics BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. AUTO-ASSIGNMENT LOGS TABLE
-- Track auto-assignment decisions for transparency
-- =====================================================

CREATE TABLE IF NOT EXISTS auto_assignment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assignment_reason TEXT NOT NULL, -- e.g., 'skill_match', 'workload_balance', 'proximity'
  skill_match_score DECIMAL(5,2),
  workload_score DECIMAL(5,2),
  proximity_score DECIMAL(5,2),
  total_score DECIMAL(5,2),
  candidates_considered JSONB, -- Array of candidate user IDs and their scores
  was_overridden BOOLEAN DEFAULT false,
  overridden_by UUID REFERENCES auth.users(id),
  override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_assignment_logs_complaint ON auto_assignment_logs(complaint_id);

-- =====================================================
-- 8. PUSH NOTIFICATION SUBSCRIPTIONS TABLE
-- Store web push subscription details
-- =====================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_type TEXT DEFAULT 'web' CHECK (device_type IN ('web', 'android', 'ios')),
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_active ON push_subscriptions(is_active) WHERE is_active = true;

-- =====================================================
-- 9. WHATSAPP INTEGRATION TABLE
-- Store WhatsApp contact preferences
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT NOT NULL,
  country_code TEXT DEFAULT '+91',
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  verification_expires_at TIMESTAMPTZ,
  opt_in_notifications BOOLEAN DEFAULT true,
  opt_in_updates BOOLEAN DEFAULT true,
  opt_in_digest BOOLEAN DEFAULT false,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone ON whatsapp_contacts(phone_number);

-- =====================================================
-- 10. ADD COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add escalation tracking to complaints table
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS escalation_level INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_escalated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_auto_assigned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_assignment_log_id UUID;

-- Add more fields to profiles for staff directory
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS years_of_experience DECIMAL(4,1);

-- =====================================================
-- 11. FUNCTIONS FOR AUTO-ASSIGNMENT
-- =====================================================

-- Function to get best available staff for a complaint
CREATE OR REPLACE FUNCTION get_best_available_staff(
  p_category_id UUID,
  p_department_id UUID,
  p_priority TEXT DEFAULT 'medium'
) RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  skill_score DECIMAL,
  workload_score DECIMAL,
  total_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id as user_id,
    p.full_name as full_name,
    COALESCE(ss.proficiency_level, 1)::DECIMAL as skill_score,
    (sa.max_workload - sa.current_workload)::DECIMAL as workload_score,
    (COALESCE(ss.proficiency_level, 1) * 0.6 + (sa.max_workload - sa.current_workload) * 0.4)::DECIMAL as total_score
  FROM profiles p
  INNER JOIN user_roles ur ON p.user_id = ur.user_id
  LEFT JOIN staff_skills ss ON p.user_id = ss.user_id AND ss.category_id = p_category_id
  LEFT JOIN staff_availability sa ON p.user_id = sa.user_id
  WHERE ur.role = 'maintenance_staff'
    AND ur.department_id = p_department_id
    AND (sa.status IS NULL OR sa.status = 'available')
    AND (sa.current_workload IS NULL OR sa.current_workload < sa.max_workload)
    AND (sa.is_on_duty IS NULL OR sa.is_on_duty = true)
  ORDER BY total_score DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to check and perform escalations
CREATE OR REPLACE FUNCTION check_and_escalate_complaints() RETURNS INTEGER AS $$
DECLARE
  escalated_count INTEGER := 0;
  complaint_record RECORD;
  rule_record RECORD;
BEGIN
  FOR complaint_record IN 
    SELECT c.id, c.department_id, c.category_id, c.created_at, c.status, 
           c.escalation_level, c.assigned_to
    FROM complaints c
    WHERE c.status IN ('pending', 'acknowledged', 'approved')
      AND c.escalation_level < 3
  LOOP
    -- Find applicable escalation rule
    SELECT * INTO rule_record FROM escalation_rules er
    WHERE (er.department_id IS NULL OR er.department_id = complaint_record.department_id)
      AND (er.category_id IS NULL OR er.category_id = complaint_record.category_id)
      AND er.level = complaint_record.escalation_level + 1
      AND er.is_active = true
      AND EXTRACT(EPOCH FROM (NOW() - complaint_record.created_at)) / 3600 >= er.escalate_after_hours
    ORDER BY 
      CASE WHEN er.department_id IS NOT NULL AND er.category_id IS NOT NULL THEN 1
           WHEN er.department_id IS NOT NULL THEN 2
           WHEN er.category_id IS NOT NULL THEN 3
           ELSE 4 END
    LIMIT 1;
    
    IF rule_record IS NOT NULL THEN
      -- Update complaint escalation level
      UPDATE complaints 
      SET escalation_level = complaint_record.escalation_level + 1,
          last_escalated_at = NOW(),
          updated_at = NOW()
      WHERE id = complaint_record.id;
      
      -- Log escalation
      INSERT INTO escalation_history (
        complaint_id, escalation_rule_id, escalated_from_user_id, 
        escalation_level, reason
      ) VALUES (
        complaint_record.id, rule_record.id, complaint_record.assigned_to,
        complaint_record.escalation_level + 1, 'Auto-escalated: No response within ' || rule_record.escalate_after_hours || ' hours'
      );
      
      escalated_count := escalated_count + 1;
    END IF;
  END LOOP;
  
  RETURN escalated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_assignment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;

-- Escalation rules: Admin can CRUD, others can read active rules
CREATE POLICY "Admin can manage escalation rules" ON escalation_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "All authenticated can read active escalation rules" ON escalation_rules
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Staff availability: Staff can update own, admins/HOD can view all
CREATE POLICY "Staff can manage own availability" ON staff_availability
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admin/HOD can view all availability" ON staff_availability
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hod', 'principal'))
  );

-- Push subscriptions: Users can only manage their own
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- WhatsApp contacts: Users can only manage their own
CREATE POLICY "Users manage own whatsapp contacts" ON whatsapp_contacts
  FOR ALL USING (user_id = auth.uid());

-- Digest preferences: Users can only manage their own
CREATE POLICY "Users manage own digest preferences" ON digest_preferences
  FOR ALL USING (user_id = auth.uid());

-- Staff skills: Staff can manage own, admins can manage all
CREATE POLICY "Staff can manage own skills" ON staff_skills
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all skills" ON staff_skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "All can view staff skills" ON staff_skills
  FOR SELECT USING (auth.role() = 'authenticated');

-- Staff shifts: Admin/HOD can manage, staff can view own
CREATE POLICY "Admin/HOD can manage shifts" ON staff_shifts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hod'))
  );

CREATE POLICY "Staff can view own shifts" ON staff_shifts
  FOR SELECT USING (user_id = auth.uid());

-- Escalation history: Viewable by stakeholders
CREATE POLICY "Stakeholders can view escalation history" ON escalation_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hod', 'principal'))
    OR EXISTS (
      SELECT 1 FROM complaints c 
      WHERE c.id = escalation_history.complaint_id 
        AND (c.submitted_by = auth.uid() OR c.assigned_to = auth.uid())
    )
  );

-- Auto-assignment logs: Admin and HOD can view
CREATE POLICY "Admin/HOD can view assignment logs" ON auto_assignment_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hod', 'principal'))
  );

-- =====================================================
-- 13. INSERT DEFAULT ESCALATION RULES
-- =====================================================

INSERT INTO escalation_rules (level, escalate_after_hours, escalate_to_role, notify_via) VALUES
  (1, 24, 'hod', ARRAY['email', 'push', 'in_app']),
  (2, 48, 'principal', ARRAY['email', 'push', 'in_app']),
  (3, 72, 'admin', ARRAY['email', 'push', 'in_app'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- 14. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update staff workload when complaint is assigned
CREATE OR REPLACE FUNCTION update_staff_workload() RETURNS TRIGGER AS $$
BEGIN
  -- Decrease workload for old assignee
  IF OLD.assigned_to IS NOT NULL AND OLD.status IN ('approved', 'in_progress') THEN
    UPDATE staff_availability 
    SET current_workload = GREATEST(0, current_workload - 1)
    WHERE user_id = OLD.assigned_to;
  END IF;
  
  -- Increase workload for new assignee
  IF NEW.assigned_to IS NOT NULL AND NEW.status IN ('approved', 'in_progress') THEN
    INSERT INTO staff_availability (user_id, current_workload)
    VALUES (NEW.assigned_to, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET current_workload = staff_availability.current_workload + 1;
  END IF;
  
  -- Decrease workload when completed
  IF NEW.status IN ('completed', 'closed', 'rejected') AND OLD.status NOT IN ('completed', 'closed', 'rejected') THEN
    IF NEW.assigned_to IS NOT NULL THEN
      UPDATE staff_availability 
      SET current_workload = GREATEST(0, current_workload - 1)
      WHERE user_id = NEW.assigned_to;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_staff_workload
  AFTER UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_workload();

-- Add trigger for new assignment
CREATE OR REPLACE FUNCTION handle_complaint_assignment() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND OLD.assigned_to IS NULL THEN
    INSERT INTO staff_availability (user_id, current_workload)
    VALUES (NEW.assigned_to, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET current_workload = staff_availability.current_workload + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE escalation_rules IS 'Configurable rules for automatic complaint escalation';
COMMENT ON TABLE staff_skills IS 'Staff skills for intelligent auto-assignment';
COMMENT ON TABLE staff_availability IS 'Real-time staff availability and workload tracking';
COMMENT ON TABLE staff_shifts IS 'Staff scheduling and roster management';
COMMENT ON TABLE digest_preferences IS 'User preferences for email digest notifications';
COMMENT ON TABLE auto_assignment_logs IS 'Audit trail for automatic staff assignments';
COMMENT ON TABLE push_subscriptions IS 'Web push notification subscriptions';
COMMENT ON TABLE whatsapp_contacts IS 'WhatsApp integration contacts';
