/**
 * Digest Email Edge Function
 * 
 * Sends scheduled digest emails to HODs and Admins with:
 * - Pending complaints requiring attention
 * - Escalated complaints
 * - SLA breach warnings
 * - Performance metrics
 * 
 * Also triggers automated escalation checks before sending digests.
 * 
 * Can be invoked:
 * - Via Supabase cron schedule
 * - Via direct HTTP call: POST /functions/v1/send-digest { "digestType": "morning" }
 * - Via pg_cron for full automation
 */

// @ts-ignore: Deno module
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DigestData {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  department_id?: string;
  department_name?: string;
  pending_count: number;
  escalated_count: number;
  sla_breach_count: number;
  resolved_today: number;
  complaints: Array<{
    complaint_number: string;
    title: string;
    status: string;
    priority: string;
    hours_pending: number;
    escalation_level: number;
  }>;
}

async function getDigestData(
  supabase: any,
  digestType: 'morning' | 'evening' | 'weekly'
): Promise<DigestData[]> {
  // Get users who should receive digests
  const { data: preferences } = await supabase
    .from('digest_preferences')
    .select(`
      user_id,
      profiles(email, full_name),
      user_roles(role, department_id, departments(name))
    `)
    .eq(
      digestType === 'morning' ? 'morning_digest_enabled' :
        digestType === 'evening' ? 'evening_digest_enabled' : 'weekly_report_enabled',
      true
    );

  if (!preferences || preferences.length === 0) {
    // Default: Get all HODs and Admins
    const { data: hodAdmins } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        department_id,
        profiles(email, full_name),
        departments(name)
      `)
      .in('role', ['hod', 'admin', 'principal']);

    if (!hodAdmins) return [];

    const digestData: DigestData[] = [];

    for (const user of hodAdmins) {
      const departmentFilter = user.role === 'hod' && user.department_id
        ? { department_id: user.department_id }
        : {};

      // Get pending complaints
      let pendingQuery = supabase
        .from('complaints')
        .select('complaint_number, title, status, priority, created_at, escalation_level')
        .in('status', ['pending', 'acknowledged']);

      if (departmentFilter.department_id) {
        pendingQuery = pendingQuery.eq('department_id', departmentFilter.department_id);
      }

      const { data: pendingComplaints } = await pendingQuery.limit(10);

      // Get escalated complaints
      let escalatedQuery = supabase
        .from('complaints')
        .select('complaint_number, title, status, priority, created_at, escalation_level')
        .gt('escalation_level', 0);

      if (departmentFilter.department_id) {
        escalatedQuery = escalatedQuery.eq('department_id', departmentFilter.department_id);
      }

      const { data: escalatedComplaints } = await escalatedQuery;

      // Get SLA breaches
      let slaQuery = supabase
        .from('sla_tracking')
        .select('complaint_id')
        .or('is_response_breached.eq.true,is_resolution_breached.eq.true');

      const { data: slaBreaches } = await slaQuery;

      // Get resolved today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let resolvedQuery = supabase
        .from('complaints')
        .select('id')
        .eq('status', 'completed')
        .gte('resolved_at', today.toISOString());

      if (departmentFilter.department_id) {
        resolvedQuery = resolvedQuery.eq('department_id', departmentFilter.department_id);
      }

      const { data: resolvedToday } = await resolvedQuery;

      const now = new Date();
      const complaints = (pendingComplaints || []).map((c: any) => ({
        ...c,
        hours_pending: Math.round((now.getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60))
      }));

      digestData.push({
        user_id: user.user_id,
        email: user.profiles?.email || '',
        full_name: user.profiles?.full_name || 'User',
        role: user.role,
        department_id: user.department_id,
        department_name: user.departments?.name,
        pending_count: pendingComplaints?.length || 0,
        escalated_count: escalatedComplaints?.length || 0,
        sla_breach_count: slaBreaches?.length || 0,
        resolved_today: resolvedToday?.length || 0,
        complaints
      });
    }

    return digestData;
  }

  return [];
}

function generateEmailHtml(data: DigestData, digestType: string): string {
  const priorityColors: Record<string, string> = {
    critical: '#dc2626',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  const complaintsHtml = data.complaints.length > 0
    ? data.complaints.map(c => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${c.complaint_number}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${c.title}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="background: ${priorityColors[c.priority] || '#6b7280'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${c.priority.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${c.hours_pending}h ago
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${c.escalation_level > 0 ? `Level ${c.escalation_level}` : '-'}
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="5" style="padding: 24px; text-align: center; color: #6b7280;">No pending complaints!</td></tr>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">PU Unicare</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">
            ${digestType === 'morning' ? 'Morning Digest' : digestType === 'evening' ? 'Evening Summary' : 'Weekly Report'}
          </p>
        </div>

        <!-- Greeting -->
        <div style="background: white; padding: 24px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 8px 0; color: #1f2937;">
            Good ${digestType === 'morning' ? 'Morning' : 'Evening'}, ${data.full_name}!
          </h2>
          <p style="color: #6b7280; margin: 0;">
            Here's your ${data.department_name ? data.department_name + ' department' : 'system'} maintenance overview.
          </p>
        </div>

        <!-- Stats Cards -->
        <div style="background: white; padding: 0 24px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 16px; text-align: center; background: #fef3c7; border-radius: 8px;">
                <div style="font-size: 32px; font-weight: bold; color: #d97706;">${data.pending_count}</div>
                <div style="font-size: 12px; color: #92400e;">Pending</div>
              </td>
              <td style="width: 12px;"></td>
              <td style="padding: 16px; text-align: center; background: #fee2e2; border-radius: 8px;">
                <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${data.escalated_count}</div>
                <div style="font-size: 12px; color: #991b1b;">Escalated</div>
              </td>
              <td style="width: 12px;"></td>
              <td style="padding: 16px; text-align: center; background: #fce7f3; border-radius: 8px;">
                <div style="font-size: 32px; font-weight: bold; color: #db2777;">${data.sla_breach_count}</div>
                <div style="font-size: 12px; color: #9d174d;">SLA Breaches</div>
              </td>
              <td style="width: 12px;"></td>
              <td style="padding: 16px; text-align: center; background: #dcfce7; border-radius: 8px;">
                <div style="font-size: 32px; font-weight: bold; color: #16a34a;">${data.resolved_today}</div>
                <div style="font-size: 12px; color: #166534;">Resolved Today</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Complaints Table -->
        <div style="background: white; padding: 24px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px 0; color: #1f2937;">
            Complaints Requiring Attention
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">ID</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Title</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Priority</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Age</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Escalation</th>
              </tr>
            </thead>
            <tbody>
              ${complaintsHtml}
            </tbody>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="background: white; padding: 24px; text-align: center; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <a href="https://unicare.pu.edu/dashboard/${data.role}" 
             style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Open Dashboard
          </a>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            You received this email because you're subscribed to PU Unicare digest notifications.
            <br>
            <a href="#" style="color: #6b7280;">Manage preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendDigestEmail(
  email: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured - digest would be sent to:', email, 'subject:', subject);
    return true; // Return true to not count as failure in dev
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PU Unicare <noreply@unicare.pu.edu>',
        to: email,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send digest email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending digest email:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { digestType = 'morning' } = await req.json().catch(() => ({}));

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Trigger Escalation Logic first
    console.log('Triggering automated escalation check...');
    const { data: escalationCount, error: escalationError } = await supabase.rpc('check_and_escalate_complaints');

    if (escalationError) {
      console.error('Error during automated escalation:', escalationError);
    } else {
      console.log(`Successfully escalated ${escalationCount || 0} complaints.`);
    }

    // 2. Process scheduled feedback emails (from sendResolutionEmail)
    console.log('Processing scheduled feedback emails...');
    const now = new Date().toISOString();
    const { data: scheduledEmails } = await supabase
      .from('scheduled_emails' as any)
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(50);

    if (scheduledEmails && scheduledEmails.length > 0) {
      for (const email of scheduledEmails) {
        try {
          const subject = `How did we do? Rate complaint ${email.complaint_data?.complaintNumber || ''}`;
          // Use the digest edge function to send
          await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'feedback_request',
              to: [email.recipient_email],
              subject,
              data: typeof email.complaint_data === 'string' ? JSON.parse(email.complaint_data) : email.complaint_data,
            }),
          });

          // Mark as sent
          await supabase
            .from('scheduled_emails' as any)
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', email.id);
        } catch (err) {
          console.error('Failed to send scheduled email:', err);
          await supabase
            .from('scheduled_emails' as any)
            .update({ status: 'failed', error: String(err) })
            .eq('id', email.id);
        }
      }
    }

    // 3. Get digest data for all relevant users
    const digestData = await getDigestData(supabase, digestType);

    let sentCount = 0;
    let failedCount = 0;

    for (const data of digestData) {
      if (!data.email) continue;

      const subject = digestType === 'morning'
        ? `Morning Brief: ${data.pending_count} complaints need attention`
        : digestType === 'evening'
          ? `Evening Summary: ${data.resolved_today} resolved today`
          : `Weekly Report: ${data.department_name || 'PU Unicare'}`;

      const html = generateEmailHtml(data, digestType);

      const sent = await sendDigestEmail(data.email, subject, html);
      if (sent) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Digest emails sent: ${sentCount} successful, ${failedCount} failed`,
        sentCount,
        failedCount,
        escalationCount: escalationCount || 0,
        scheduledEmailsProcessed: scheduledEmails?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-digest function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
