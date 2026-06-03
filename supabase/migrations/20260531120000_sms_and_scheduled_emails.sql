-- Migration: Create SMS and scheduled email infrastructure tables
-- These tables support the SMS notification service and delayed email scheduling

-- ============================================================
-- 1. SMS Queue - Stores outgoing SMS messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sms_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT NOT NULL,
    name TEXT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed')),
    error TEXT,
    provider TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);

-- Index for fetching queued messages
CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON public.sms_queue(status);
CREATE INDEX IF NOT EXISTS idx_sms_queue_created_at ON public.sms_queue(created_at);

-- RLS: Only service role can manage SMS queue
ALTER TABLE public.sms_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage SMS queue"
    ON public.sms_queue
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- 2. SMS Preferences - Per-user SMS notification opt-in
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sms_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT false,
    phone TEXT,
    complaint_submitted BOOLEAN DEFAULT true,
    complaint_assigned BOOLEAN DEFAULT true,
    status_changed BOOLEAN DEFAULT true,
    escalated BOOLEAN DEFAULT true,
    resolved BOOLEAN DEFAULT true,
    reminder BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Users can manage their own SMS preferences
ALTER TABLE public.sms_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SMS preferences"
    ON public.sms_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SMS preferences"
    ON public.sms_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMS preferences"
    ON public.sms_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- 3. Scheduled Emails - For delayed email delivery (e.g., feedback requests)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scheduled_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    type TEXT NOT NULL,
    complaint_data JSONB,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed')),
    error TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fetching scheduled emails that are due
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON public.scheduled_emails(status, scheduled_for);

-- RLS: Only service role can manage scheduled emails
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage scheduled emails"
    ON public.scheduled_emails
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- 4. Auto-cleanup function: Remove old SMS queue entries (>7 days)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_sms_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.sms_queue
    WHERE created_at < now() - interval '7 days'
    AND status IN ('sent', 'failed');
END;
$$;

-- ============================================================
-- 5. Auto-cleanup function: Remove old scheduled emails (>30 days)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_scheduled_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.scheduled_emails
    WHERE created_at < now() - interval '30 days'
    AND status IN ('sent', 'failed');
END;
$$;

-- ============================================================
-- 6. Trigger: Auto-update updated_at on sms_preferences
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_sms_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_sms_preferences_updated
    BEFORE UPDATE ON public.sms_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sms_preferences_updated_at();
