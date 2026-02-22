# 🚀 PU Unicare Deployment Guide (Phases 1-6)

Follow these steps to activate all the features implemented in Phases 1 through 6.

## 1. Database Migration (Critical)
You need to create the database tables for the new features (escalation, skills, SMS, etc.).

```bash
npx supabase db push
```

## 2. Deploy Edge Functions
Deploy the functions for sending emails and scheduled digests.

```bash
# 1. Set your Resend API Key (Get a free key from resend.com)
npx supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# 2. Deploy the functions
npx supabase functions deploy send-email
npx supabase functions deploy send-digest
```

## 3. Schedule Daily Digests
To enable the automatic daily email digests for HODs, run this SQL query in your **Supabase Dashboard > SQL Editor**:

```sql
SELECT cron.schedule('morning-digest', '0 8 * * *', 
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-digest',
    body := '{"type":"morning"}'
  )$$
);
```

## 4. Environment Variables
Make sure your `.env` file (or Vercel environment variables) contains:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Feature Links
The following new pages are available. You may want to add links to them in your dashboard sidebar if they aren't visible:

- **Help Center**: `/help-center`
- **Staff Directory**: `/staff-directory`
- **Track Complaint**: `/track`

## 6. How to Test
1. **Notifications**: Register a new complaint. You should receive an immediate email confirmation.
2. **AI Categorization**: Type "The water pipe is leaking in the bathroom" in the complaint description. Developing... The "AI Suggestions" box should appear.
3. **Analytics**: As an Admin, visit the Dashboard to see the new charts.
4. **Help Center**: Visit `/help-center` to see the FAQ and Smart Search.

## Troubleshooting
- **Emails not sending?** Check the Edge Function logs in Supabase Dashboard. Ensure `RESEND_API_KEY` is set.
- **AI suggestions not appearing?** Type at least 10 characters in the description field.
