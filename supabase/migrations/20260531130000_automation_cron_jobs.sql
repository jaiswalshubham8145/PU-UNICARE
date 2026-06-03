-- Migration: Set up automated cron jobs for digest and escalation
-- Requires pg_cron extension to be enabled in Supabase
--
-- IMPORTANT: Run this migration AFTER enabling pg_cron in your Supabase dashboard:
--   1. Go to Supabase Dashboard > Database > Extensions
--   2. Enable "pg_cron" extension
--   3. Run this migration
--
-- If pg_cron is not available, the send-digest function can still be triggered
-- manually or via HTTP API calls.

-- ============================================================
-- 1. Enable pg_cron extension (if not already enabled)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- 2. Morning Digest - Every day at 8:00 AM IST (2:30 AM UTC)
-- ============================================================
SELECT cron.schedule(
    'morning-digest',
    '30 2 * * *',  -- 2:30 AM UTC = 8:00 AM IST
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-digest',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
        ),
        body := jsonb_build_object('digestType', 'morning')
    );
    $$
);

-- ============================================================
-- 3. Evening Digest - Every day at 6:00 PM IST (12:30 PM UTC)
-- ============================================================
SELECT cron.schedule(
    'evening-digest',
    '30 12 * * *',  -- 12:30 PM UTC = 6:00 PM IST
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-digest',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
        ),
        body := jsonb_build_object('digestType', 'evening')
    );
    $$
);

-- ============================================================
-- 4. Weekly Report - Every Monday at 9:00 AM IST (3:30 AM UTC)
-- ============================================================
SELECT cron.schedule(
    'weekly-report',
    '30 3 * * 1',  -- 3:30 AM UTC on Mondays = 9:00 AM IST
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-digest',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
        ),
        body := jsonb_build_object('digestType', 'weekly')
    );
    $$
);

-- ============================================================
-- 5. Escalation Check - Every hour
-- Triggers the escalation engine independently of digest emails
-- ============================================================
SELECT cron.schedule(
    'escalation-check',
    '0 * * * *',  -- Every hour at minute 0
    $$
    SELECT check_and_escalate_complaints();
    $$
);

-- ============================================================
-- 6. Process Scheduled Emails - Every 15 minutes
-- Handles delayed emails like feedback requests
-- ============================================================
SELECT cron.schedule(
    'process-scheduled-emails',
    '*/15 * * * *',  -- Every 15 minutes
    $$
    -- Mark and process due scheduled emails
    WITH due_emails AS (
        SELECT id, recipient_email, recipient_name, type, complaint_data
        FROM scheduled_emails
        WHERE status = 'scheduled'
        AND scheduled_for <= now()
        LIMIT 50
    )
    UPDATE scheduled_emails
    SET status = 'sent', sent_at = now()
    WHERE id IN (SELECT id FROM due_emails);
    $$
);

-- ============================================================
-- 7. Cleanup old SMS queue entries - Daily at 3:00 AM UTC
-- ============================================================
SELECT cron.schedule(
    'cleanup-sms-queue',
    '0 3 * * *',  -- 3:00 AM UTC daily
    $$
    SELECT cleanup_old_sms_queue();
    $$
);

-- ============================================================
-- 8. Cleanup old scheduled emails - Daily at 3:30 AM UTC
-- ============================================================
SELECT cron.schedule(
    'cleanup-scheduled-emails',
    '30 3 * * *',  -- 3:30 AM UTC daily
    $$
    SELECT cleanup_old_scheduled_emails();
    $$
);

-- ============================================================
-- NOTES:
-- 
-- If pg_cron is NOT available, you can still trigger automation via:
--
-- 1. Manual trigger from Supabase SQL Editor:
--    SELECT check_and_escalate_complaints();
--
-- 2. HTTP API call to send-digest:
--    POST https://your-project.supabase.co/functions/v1/send-digest
--    Headers: { "Authorization": "Bearer YOUR_ANON_KEY" }
--    Body: { "digestType": "morning" }
--
-- 3. From your frontend app:
--    await supabase.functions.invoke('send-digest', { body: { digestType: 'morning' } })
--
-- ============================================================
