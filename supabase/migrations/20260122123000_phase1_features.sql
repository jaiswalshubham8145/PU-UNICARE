-- =====================================================
-- Phase 1 Features Migration
-- Includes: Notifications, SLA Management, Ratings & Feedback
-- =====================================================
-- NOTE: This migration assumes existing types (app_role, complaint_priority, complaint_status)
-- and tables (complaints, profiles, etc.) already exist from previous migrations.
-- =====================================================

-- =====================================================
-- 1. NOTIFICATIONS SYSTEM
-- =====================================================

-- Create notification type enum (only if it doesn't exist)
DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM (
    'complaint_created',
    'complaint_assigned',
    'complaint_updated',
    'complaint_completed',
    'complaint_approved',
    'complaint_rejected',
    'sla_warning',
    'sla_breach',
    'system_announcement'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  related_complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (safe - won't error if already enabled)
DO $$ BEGIN
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Policies for notifications (with error handling)
DO $$ BEGIN
  CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Index for better performance (with error handling)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- 2. SLA MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sla_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.maintenance_categories(id) ON DELETE CASCADE,
  priority complaint_priority NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  response_time_hours INTEGER NOT NULL, -- Time to acknowledge
  resolution_time_hours INTEGER NOT NULL, -- Time to complete
  escalation_time_hours INTEGER, -- Time before escalation
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (category_id, priority, department_id)
);

-- Enable RLS
ALTER TABLE public.sla_rules ENABLE ROW LEVEL SECURITY;

-- Policies for SLA rules
CREATE POLICY "Anyone can view SLA rules" ON public.sla_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage SLA rules" ON public.sla_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Table to track SLA compliance
CREATE TABLE IF NOT EXISTS public.sla_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL UNIQUE,
  sla_rule_id UUID REFERENCES public.sla_rules(id),
  response_due_at TIMESTAMP WITH TIME ZONE,
  resolution_due_at TIMESTAMP WITH TIME ZONE,
  escalation_due_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  is_response_breached BOOLEAN NOT NULL DEFAULT false,
  is_resolution_breached BOOLEAN NOT NULL DEFAULT false,
  is_escalated BOOLEAN NOT NULL DEFAULT false,
  breach_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sla_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for SLA tracking
CREATE POLICY "Users can view SLA tracking for accessible complaints" ON public.sla_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
      AND (
        c.submitted_by = auth.uid()
        OR c.assigned_to = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'principal')
        OR (public.has_role(auth.uid(), 'hod') AND c.department_id = public.get_user_department(auth.uid()))
      )
    )
  );

CREATE POLICY "System can manage SLA tracking" ON public.sla_tracking
  FOR ALL USING (true);

-- Index for SLA tracking
CREATE INDEX idx_sla_tracking_complaint_id ON public.sla_tracking(complaint_id);
CREATE INDEX idx_sla_tracking_response_due ON public.sla_tracking(response_due_at) WHERE responded_at IS NULL;
CREATE INDEX idx_sla_tracking_resolution_due ON public.sla_tracking(resolution_due_at) WHERE resolved_at IS NULL;

-- =====================================================
-- 3. RATINGS & FEEDBACK SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.complaint_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL UNIQUE,
  rated_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  response_time INTEGER CHECK (response_time >= 1 AND response_time <= 5),
  staff_professionalism INTEGER CHECK (staff_professionalism >= 1 AND staff_professionalism <= 5),
  resolution_satisfaction INTEGER CHECK (resolution_satisfaction >= 1 AND resolution_satisfaction <= 5),
  would_recommend BOOLEAN,
  improvement_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaint_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for ratings
CREATE POLICY "Users can view ratings for accessible complaints" ON public.complaint_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
      AND (
        c.submitted_by = auth.uid()
        OR c.assigned_to = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'principal')
        OR (public.has_role(auth.uid(), 'hod') AND c.department_id = public.get_user_department(auth.uid()))
      )
    )
  );

CREATE POLICY "Users can rate their own complaints" ON public.complaint_ratings
  FOR INSERT WITH CHECK (
    auth.uid() = rated_by
    AND EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id
      AND submitted_by = auth.uid()
      AND status IN ('completed', 'closed')
    )
  );

CREATE POLICY "Users can update their own ratings" ON public.complaint_ratings
  FOR UPDATE USING (auth.uid() = rated_by);

-- Index for ratings
CREATE INDEX idx_complaint_ratings_complaint_id ON public.complaint_ratings(complaint_id);
CREATE INDEX idx_complaint_ratings_rated_by ON public.complaint_ratings(rated_by);
CREATE INDEX idx_complaint_ratings_rating ON public.complaint_ratings(rating);

-- =====================================================
-- 4. ANALYTICS TABLES
-- =====================================================

-- Materialized view for department analytics
CREATE MATERIALIZED VIEW public.department_analytics AS
SELECT 
  d.id AS department_id,
  d.name AS department_name,
  COUNT(c.id) AS total_complaints,
  COUNT(CASE WHEN c.status = 'pending' THEN 1 END) AS pending_count,
  COUNT(CASE WHEN c.status = 'in_progress' THEN 1 END) AS in_progress_count,
  COUNT(CASE WHEN c.status IN ('completed', 'closed') THEN 1 END) AS completed_count,
  AVG(CASE WHEN c.status IN ('completed', 'closed') AND c.resolved_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at))/3600 END) AS avg_resolution_hours,
  AVG(cr.rating) AS avg_rating,
  COUNT(CASE WHEN st.is_resolution_breached THEN 1 END) AS sla_breaches
FROM public.departments d
LEFT JOIN public.complaints c ON d.id = c.department_id
LEFT JOIN public.complaint_ratings cr ON c.id = cr.complaint_id
LEFT JOIN public.sla_tracking st ON c.id = st.complaint_id
GROUP BY d.id, d.name;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_department_analytics_dept_id ON public.department_analytics(department_id);

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION public.refresh_department_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.department_analytics;
END;
$$;

-- =====================================================
-- 5. FUNCTIONS FOR NOTIFICATIONS
-- =====================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _type notification_type,
  _title TEXT,
  _message TEXT,
  _link TEXT DEFAULT NULL,
  _complaint_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link, related_complaint_id)
  VALUES (_user_id, _type, _title, _message, _link, _complaint_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to notify on complaint status change
CREATE OR REPLACE FUNCTION public.notify_complaint_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type notification_type;
BEGIN
  -- Only notify on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Determine notification type and message
    CASE NEW.status
      WHEN 'acknowledged' THEN
        notification_type := 'complaint_updated';
        notification_title := 'Complaint Acknowledged';
        notification_message := 'Your complaint #' || NEW.complaint_number || ' has been acknowledged.';
      WHEN 'approved' THEN
        notification_type := 'complaint_approved';
        notification_title := 'Complaint Approved';
        notification_message := 'Your complaint #' || NEW.complaint_number || ' has been approved for action.';
      WHEN 'in_progress' THEN
        notification_type := 'complaint_updated';
        notification_title := 'Work Started';
        notification_message := 'Work has started on your complaint #' || NEW.complaint_number || '.';
      WHEN 'completed' THEN
        notification_type := 'complaint_completed';
        notification_title := 'Complaint Resolved';
        notification_message := 'Your complaint #' || NEW.complaint_number || ' has been marked as completed. Please rate your experience.';
      WHEN 'rejected' THEN
        notification_type := 'complaint_rejected';
        notification_title := 'Complaint Rejected';
        notification_message := 'Your complaint #' || NEW.complaint_number || ' has been rejected.';
      ELSE
        RETURN NEW;
    END CASE;
    
    -- Notify the submitter
    PERFORM public.create_notification(
      NEW.submitted_by,
      notification_type,
      notification_title,
      notification_message,
      '/track-complaint/' || NEW.complaint_number,
      NEW.id
    );
  END IF;
  
  -- Notify when assigned
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    PERFORM public.create_notification(
      NEW.assigned_to,
      'complaint_assigned',
      'New Complaint Assigned',
      'Complaint #' || NEW.complaint_number || ' has been assigned to you.',
      '/dashboard/maintenance/new-assigned',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for complaint notifications (drop if exists first)
DROP TRIGGER IF EXISTS trigger_notify_complaint_status_change ON public.complaints;
CREATE TRIGGER trigger_notify_complaint_status_change
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_complaint_status_change();

-- =====================================================
-- 6. FUNCTIONS FOR SLA TRACKING
-- =====================================================

-- Function to calculate and set SLA deadlines
CREATE OR REPLACE FUNCTION public.set_sla_deadlines()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sla_rule RECORD;
BEGIN
  -- Find matching SLA rule
  SELECT * INTO sla_rule
  FROM public.sla_rules
  WHERE (category_id = NEW.category_id OR category_id IS NULL)
    AND priority = NEW.priority
    AND (department_id = NEW.department_id OR department_id IS NULL)
    AND is_active = true
  ORDER BY 
    CASE WHEN category_id IS NOT NULL THEN 1 ELSE 2 END,
    CASE WHEN department_id IS NOT NULL THEN 1 ELSE 2 END
  LIMIT 1;
  
  -- If SLA rule found, create tracking record
  IF FOUND THEN
    INSERT INTO public.sla_tracking (
      complaint_id,
      sla_rule_id,
      response_due_at,
      resolution_due_at,
      escalation_due_at
    ) VALUES (
      NEW.id,
      sla_rule.id,
      NEW.created_at + (sla_rule.response_time_hours || ' hours')::INTERVAL,
      NEW.created_at + (sla_rule.resolution_time_hours || ' hours')::INTERVAL,
      CASE WHEN sla_rule.escalation_time_hours IS NOT NULL 
           THEN NEW.created_at + (sla_rule.escalation_time_hours || ' hours')::INTERVAL
           ELSE NULL END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for SLA tracking (drop if exists first)
DROP TRIGGER IF EXISTS trigger_set_sla_deadlines ON public.complaints;
CREATE TRIGGER trigger_set_sla_deadlines
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sla_deadlines();

-- Function to update SLA tracking on complaint status change
CREATE OR REPLACE FUNCTION public.update_sla_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update responded_at when acknowledged
  IF OLD.status = 'pending' AND NEW.status = 'acknowledged' THEN
    UPDATE public.sla_tracking
    SET responded_at = now(),
        is_response_breached = (now() > response_due_at)
    WHERE complaint_id = NEW.id;
  END IF;
  
  -- Update resolved_at when completed
  IF NEW.status IN ('completed', 'closed') AND NEW.resolved_at IS NOT NULL THEN
    UPDATE public.sla_tracking
    SET resolved_at = NEW.resolved_at,
        is_resolution_breached = (NEW.resolved_at > resolution_due_at)
    WHERE complaint_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for SLA update (drop if exists first)
DROP TRIGGER IF EXISTS trigger_update_sla_tracking ON public.complaints;
CREATE TRIGGER trigger_update_sla_tracking
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sla_tracking();

-- =====================================================
-- 7. INSERT DEFAULT SLA RULES
-- =====================================================

-- Critical priority SLA rules (skip if already exists)
INSERT INTO public.sla_rules (category_id, priority, department_id, response_time_hours, resolution_time_hours, escalation_time_hours)
VALUES (NULL, 'critical', NULL, 1, 4, 2)
ON CONFLICT (category_id, priority, department_id) DO NOTHING;

INSERT INTO public.sla_rules (category_id, priority, department_id, response_time_hours, resolution_time_hours, escalation_time_hours)
VALUES (NULL, 'high', NULL, 2, 8, 4)
ON CONFLICT (category_id, priority, department_id) DO NOTHING;

INSERT INTO public.sla_rules (category_id, priority, department_id, response_time_hours, resolution_time_hours, escalation_time_hours)
VALUES (NULL, 'medium', NULL, 4, 24, 12)
ON CONFLICT (category_id, priority, department_id) DO NOTHING;

INSERT INTO public.sla_rules (category_id, priority, department_id, response_time_hours, resolution_time_hours, escalation_time_hours)
VALUES (NULL, 'low', NULL, 8, 48, 24)
ON CONFLICT (category_id, priority, department_id) DO NOTHING;

-- Update triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_sla_rules_updated_at ON public.sla_rules;
CREATE TRIGGER update_sla_rules_updated_at
  BEFORE UPDATE ON public.sla_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sla_tracking_updated_at ON public.sla_tracking;
CREATE TRIGGER update_sla_tracking_updated_at
  BEFORE UPDATE ON public.sla_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaint_ratings_updated_at ON public.complaint_ratings;
CREATE TRIGGER update_complaint_ratings_updated_at
  BEFORE UPDATE ON public.complaint_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
