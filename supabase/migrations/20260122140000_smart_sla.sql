-- =====================================================
-- Phase 2: Smart SLA Engine (Business Hours & Holidays)
-- =====================================================

-- 1. SYSTEM CONFIGURATION (Working Hours)
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read config" ON public.system_config FOR SELECT USING (true);
CREATE POLICY "Admins manage config" ON public.system_config USING (public.has_role(auth.uid(), 'admin'));

-- Insert Default Config: Mon-Fri, 09:00 to 17:00
INSERT INTO public.system_config (key, value, description)
VALUES (
    'business_hours',
    '{
        "work_days": [1, 2, 3, 4, 5], 
        "start_time": "09:00", 
        "end_time": "17:00",
        "timezone": "Asia/Kolkata"
    }'::jsonb,
    'Defines working days (1=Mon) and hours for SLA calculation'
) ON CONFLICT (key) DO NOTHING;

-- 2. HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read holidays" ON public.holidays FOR SELECT USING (true);
CREATE POLICY "Admins manage holidays" ON public.holidays USING (public.has_role(auth.uid(), 'admin'));

-- 3. SMART SLA CALCULATION FUNCTION
CREATE OR REPLACE FUNCTION public.calculate_sla_deadline(
    start_time TIMESTAMP WITH TIME ZONE,
    hours_to_add INTEGER
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    config JSONB;
    work_days INTEGER[];
    work_start TIME;
    work_end TIME;
    curr_time TIMESTAMP WITH TIME ZONE;
    remaining_minutes INTEGER;
    day_minutes INTEGER;
    is_holiday BOOLEAN;
    is_work_day BOOLEAN;
    day_dow INTEGER;
    minutes_in_day_remaining INTEGER;
    loop_safety INTEGER := 0;
BEGIN
    -- Get Config
    SELECT value INTO config FROM public.system_config WHERE key = 'business_hours';
    
    -- Parse Config (Defaults if missing)
    work_days := ARRAY(SELECT jsonb_array_elements_text(config->'work_days')::INT);
    work_start := (config->>'start_time')::TIME;
    work_end := (config->>'end_time')::TIME;
    remaining_minutes := hours_to_add * 60;
    curr_time := start_time;
    
    -- Calculate configured day length in minutes
    day_minutes := EXTRACT(EPOCH FROM (work_end - work_start)) / 60;

    -- Safety check for bad config
    IF day_minutes <= 0 THEN 
        RETURN start_time + (hours_to_add || ' hours')::INTERVAL; 
    END IF;

    -- Iteration Loop
    WHILE remaining_minutes > 0 LOOP
        loop_safety := loop_safety + 1;
        IF loop_safety > 1000 THEN -- Prevent infinite loops
            EXIT; 
        END IF;

        day_dow := EXTRACT(ISODOW FROM curr_time)::INTEGER;
        is_work_day := day_dow = ANY(work_days);
        
        -- Check if holiday
        SELECT EXISTS(SELECT 1 FROM public.holidays WHERE date = curr_time::DATE) INTO is_holiday;

        -- If NOT a working day or IS a holiday, skip to next day start
        IF NOT is_work_day OR is_holiday THEN
            curr_time := (curr_time::DATE + INTERVAL '1 day' + work_start)::TIMESTAMP WITH TIME ZONE;
            CONTINUE;
        END IF;

        -- If current time is before work start, move to work start
        IF curr_time::TIME < work_start THEN
            curr_time := (curr_time::DATE + work_start)::TIMESTAMP WITH TIME ZONE;
        END IF;

        -- If current time is after work end, move to next day start
        IF curr_time::TIME >= work_end THEN
            curr_time := (curr_time::DATE + INTERVAL '1 day' + work_start)::TIMESTAMP WITH TIME ZONE;
            CONTINUE;
        END IF;

        -- Calculate minutes remaining in THIS working day
        minutes_in_day_remaining := EXTRACT(EPOCH FROM (work_end - curr_time::TIME)) / 60;

        IF minutes_in_day_remaining >= remaining_minutes THEN
            -- We can finish today
            curr_time := curr_time + (remaining_minutes || ' minutes')::INTERVAL;
            remaining_minutes := 0;
        ELSE
            -- Consume rest of today and continue
            remaining_minutes := remaining_minutes - minutes_in_day_remaining;
            curr_time := (curr_time::DATE + INTERVAL '1 day' + work_start)::TIMESTAMP WITH TIME ZONE;
        END IF;
    END LOOP;

    RETURN curr_time;
END;
$$;

-- 4. UPDATE SLA TRIGGER TO USE SMART CALCULATION
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
  
  -- If SLA rule found, create tracking record using SMART CALCULATION
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
      -- USE THE NEW FUNCTION HERE
      public.calculate_sla_deadline(NEW.created_at, sla_rule.response_time_hours),
      public.calculate_sla_deadline(NEW.created_at, sla_rule.resolution_time_hours),
      CASE WHEN sla_rule.escalation_time_hours IS NOT NULL 
           THEN public.calculate_sla_deadline(NEW.created_at, sla_rule.escalation_time_hours)
           ELSE NULL END
    );
  END IF;
  
  RETURN NEW;
END;
$$;
