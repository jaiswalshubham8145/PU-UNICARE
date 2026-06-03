-- Migration: Webhook System for External Integrations

-- ============================================================
-- 1. WEBHOOK CONFIGURATION TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    events TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    headers JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 5000,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. WEBHOOK DELIVERY LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    success BOOLEAN DEFAULT false,
    attempt INTEGER DEFAULT 1,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook 
ON public.webhook_deliveries(webhook_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status 
ON public.webhook_deliveries(success, next_retry_at);

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage webhooks"
    ON public.webhooks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook deliveries"
    ON public.webhook_deliveries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- 4. WEBHOOK TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.trigger_webhooks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_webhook RECORD;
    v_event TEXT;
    v_payload JSONB;
BEGIN
    -- Determine event type
    v_event := TG_OP || ':' || TG_TABLE_NAME;
    
    -- Build payload
    v_payload := jsonb_build_object(
        'event', v_event,
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', now(),
        'data', CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            ELSE to_jsonb(NEW)
        END
    );
    
    -- Find matching webhooks
    FOR v_webhook IN 
        SELECT * FROM public.webhooks
        WHERE is_active = true
        AND (v_event = ANY(events) OR '*' = ANY(events))
    LOOP
        -- Insert delivery record
        INSERT INTO public.webhook_deliveries (webhook_id, event, payload, next_retry_at)
        VALUES (v_webhook.id, v_event, v_payload, now());
    END LOOP;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- 5. ATTACH TRIGGERS TO KEY TABLES
-- ============================================================

-- Complaints webhook
DROP TRIGGER IF EXISTS webhook_complaints ON public.complaints;
CREATE TRIGGER webhook_complaints
    AFTER INSERT OR UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_webhooks();

-- Escalation webhook
DROP TRIGGER IF EXISTS webhook_escalations ON public.escalation_history;
CREATE TRIGGER webhook_escalations
    AFTER INSERT ON public.escalation_history
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_webhooks();

-- ============================================================
-- 6. WEBHOOK MANAGEMENT FUNCTIONS
-- ============================================================

-- Create webhook
CREATE OR REPLACE FUNCTION public.create_webhook(
    p_name TEXT,
    p_url TEXT,
    p_events TEXT[],
    p_secret TEXT DEFAULT NULL,
    p_headers JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.webhooks (name, url, events, secret, headers, created_by)
    VALUES (p_name, p_url, p_events, p_secret, p_headers, auth.uid())
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- Test webhook
CREATE OR REPLACE FUNCTION public.test_webhook(p_webhook_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_webhook RECORD;
    v_test_payload JSONB;
BEGIN
    SELECT * INTO v_webhook FROM public.webhooks WHERE id = p_webhook_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Webhook not found';
    END IF;
    
    v_test_payload := jsonb_build_object(
        'event', 'test',
        'timestamp', now(),
        'message', 'This is a test webhook delivery'
    );
    
    INSERT INTO public.webhook_deliveries (webhook_id, event, payload, success)
    VALUES (p_webhook_id, 'test', v_test_payload, true);
    
    RETURN true;
END;
$$;

-- Get webhook statistics
CREATE OR REPLACE FUNCTION public.get_webhook_stats(p_webhook_id UUID)
RETURNS TABLE (
    total_deliveries BIGINT,
    successful_deliveries BIGINT,
    failed_deliveries BIGINT,
    success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT AS total_deliveries,
        COUNT(*) FILTER (WHERE success = true)::BIGINT AS successful_deliveries,
        COUNT(*) FILTER (WHERE success = false)::BIGINT AS failed_deliveries,
        ROUND(
            CASE 
                WHEN COUNT(*) > 0 
                THEN (COUNT(*) FILTER (WHERE success = true)::numeric / COUNT(*) * 100)
                ELSE 0 
            END, 1
        ) AS success_rate
    FROM public.webhook_deliveries
    WHERE webhook_id = p_webhook_id;
END;
$$;
