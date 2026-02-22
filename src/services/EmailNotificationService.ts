/**
 * Email Notification Service
 * 
 * Centralized email service for all complaint lifecycle events.
 * Sends beautiful HTML emails for:
 * - Complaint submitted
 * - Complaint assigned
 * - Status changes
 * - Escalations
 * - Resolution
 * - Feedback requests
 */

import { supabase } from '@/integrations/supabase/client';

export type EmailType =
    | 'complaint_submitted'
    | 'complaint_assigned'
    | 'status_changed'
    | 'escalated'
    | 'resolved'
    | 'feedback_request'
    | 'reminder'
    | 'digest';

interface EmailRecipient {
    email: string;
    name: string;
}

interface ComplaintEmailData {
    complaintNumber: string;
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    status?: string;
    location?: string;
    departmentName?: string;
    assignedStaffName?: string;
    complainantName?: string;
    escalationLevel?: number;
    escalationReason?: string;
    resolutionNotes?: string;
    trackingUrl?: string;
    actionUrl?: string;
}

interface SendEmailParams {
    to: EmailRecipient | EmailRecipient[];
    type: EmailType;
    data: ComplaintEmailData;
    cc?: EmailRecipient[];
}

// Email template styles
const styles = {
    container: `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,
    header: `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 32px 24px;
    text-align: center;
  `,
    headerTitle: `
    color: white;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  `,
    headerSubtitle: `
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-top: 8px;
  `,
    body: `
    padding: 32px 24px;
  `,
    greeting: `
    font-size: 18px;
    color: #1a1a2e;
    margin-bottom: 16px;
  `,
    message: `
    font-size: 15px;
    color: #4a4a68;
    line-height: 1.6;
    margin-bottom: 24px;
  `,
    card: `
    background: #f8f9fc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  `,
    cardTitle: `
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #8b8ba7;
    margin-bottom: 12px;
  `,
    row: `
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eaeaf0;
  `,
    label: `
    font-size: 14px;
    color: #6b6b80;
  `,
    value: `
    font-size: 14px;
    color: #1a1a2e;
    font-weight: 500;
  `,
    button: `
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
  `,
    buttonSecondary: `
    display: inline-block;
    background: #f0f0f5;
    color: #667eea;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
    margin-left: 12px;
  `,
    footer: `
    background: #f8f9fc;
    padding: 24px;
    text-align: center;
    border-top: 1px solid #eaeaf0;
  `,
    footerText: `
    font-size: 13px;
    color: #8b8ba7;
    margin: 0;
  `,
    statusBadge: (status: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            pending: { bg: '#fef3c7', text: '#d97706' },
            approved: { bg: '#dbeafe', text: '#2563eb' },
            assigned: { bg: '#e0e7ff', text: '#4f46e5' },
            in_progress: { bg: '#fef9c3', text: '#ca8a04' },
            on_hold: { bg: '#fee2e2', text: '#dc2626' },
            completed: { bg: '#d1fae5', text: '#059669' },
            rejected: { bg: '#fecaca', text: '#dc2626' },
        };
        const color = colors[status] || colors.pending;
        return `
      display: inline-block;
      background: ${color.bg};
      color: ${color.text};
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      text-transform: capitalize;
    `;
    },
    priorityBadge: (priority: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            low: { bg: '#d1fae5', text: '#059669' },
            medium: { bg: '#fef3c7', text: '#d97706' },
            high: { bg: '#fee2e2', text: '#dc2626' },
            critical: { bg: '#881337', text: '#ffffff' },
        };
        const color = colors[priority] || colors.medium;
        return `
      display: inline-block;
      background: ${color.bg};
      color: ${color.text};
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    `;
    },
};

// Generate email content based on type
function generateEmailContent(type: EmailType, data: ComplaintEmailData, recipientName: string): { subject: string; html: string } {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pu-unicare.vercel.app';
    const trackingUrl = data.trackingUrl || `${baseUrl}/track?number=${data.complaintNumber}`;

    const templates: Record<EmailType, { subject: string; getHtml: () => string }> = {
        complaint_submitted: {
            subject: `✅ Complaint Registered: ${data.complaintNumber}`,
            getHtml: () => `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h1 style="${styles.headerTitle}">🎫 Complaint Registered</h1>
            <p style="${styles.headerSubtitle}">Your complaint has been successfully submitted</p>
          </div>
          <div style="${styles.body}">
            <p style="${styles.greeting}">Hi ${recipientName},</p>
            <p style="${styles.message}">
              Thank you for reporting your concern. Your complaint has been registered and will be reviewed by the appropriate department shortly.
            </p>
            <div style="${styles.card}">
              <div style="${styles.cardTitle}">Complaint Details</div>
              <div style="${styles.row}">
                <span style="${styles.label}">Complaint Number</span>
                <span style="${styles.value}">${data.complaintNumber}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">Title</span>
                <span style="${styles.value}">${data.title}</span>
              </div>
              ${data.category ? `
              <div style="${styles.row}">
                <span style="${styles.label}">Category</span>
                <span style="${styles.value}">${data.category}</span>
              </div>
              ` : ''}
              ${data.priority ? `
              <div style="${styles.row}">
                <span style="${styles.label}">Priority</span>
                <span style="${styles.priorityBadge(data.priority)}">${data.priority}</span>
              </div>
              ` : ''}
              ${data.location ? `
              <div style="${styles.row}">
                <span style="${styles.label}">Location</span>
                <span style="${styles.value}">${data.location}</span>
              </div>
              ` : ''}
            </div>
            <div style="text-align: center;">
              <a href="${trackingUrl}" style="${styles.button}">Track Your Complaint</a>
            </div>
          </div>
          <div style="${styles.footer}">
            <p style="${styles.footerText}">PU Unicare - University Maintenance System</p>
          </div>
        </div>
      `,
        },

        complaint_assigned: {
            subject: `👷 Staff Assigned: ${data.complaintNumber}`,
            getHtml: () => `
        <div style="${styles.container}">
          <div style="${styles.header}; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
            <h1 style="${styles.headerTitle}">👷 Staff Assigned</h1>
            <p style="${styles.headerSubtitle}">A maintenance staff has been assigned to your complaint</p>
          </div>
          <div style="${styles.body}">
            <p style="${styles.greeting}">Hi ${recipientName},</p>
            <p style="${styles.message}">
              Great news! A maintenance staff member has been assigned to resolve your complaint.
              You can expect them to begin work on it shortly.
            </p>
            <div style="${styles.card}">
              <div style="${styles.cardTitle}">Assignment Details</div>
              <div style="${styles.row}">
                <span style="${styles.label}">Complaint Number</span>
                <span style="${styles.value}">${data.complaintNumber}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">Title</span>
                <span style="${styles.value}">${data.title}</span>
              </div>
              ${data.assignedStaffName ? `
              <div style="${styles.row}">
                <span style="${styles.label}">Assigned To</span>
                <span style="${styles.value}">👤 ${data.assignedStaffName}</span>
              </div>
              ` : ''}
              <div style="${styles.row}">
                <span style="${styles.label}">Status</span>
                <span style="${styles.statusBadge('assigned')}">Assigned</span>
              </div>
            </div>
            <div style="text-align: center;">
              <a href="${trackingUrl}" style="${styles.button}">Track Progress</a>
            </div>
          </div>
          <div style="${styles.footer}">
            <p style="${styles.footerText}">PU Unicare - University Maintenance System</p>
          </div>
        </div>
      `,
        },

        status_changed: {
            subject: `📊 Status Update: ${data.complaintNumber} - ${data.status?.replace('_', ' ')}`,
            getHtml: () => `
        <div style="${styles.container}">
          <div style="${styles.header}; background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);">
            <h1 style="${styles.headerTitle}">📊 Status Update</h1>
            <p style="${styles.headerSubtitle}">There's an update on your complaint</p>
          </div>
          <div style="${styles.body}">
            <p style="${styles.greeting}">Hi ${recipientName},</p>
            <p style="${styles.message}">
              The status of your complaint has been updated. Here are the details:
            </p>
            <div style="${styles.card}">
              <div style="${styles.cardTitle}">Complaint Status</div>
              <div style="${styles.row}">
                <span style="${styles.label}">Complaint Number</span>
                <span style="${styles.value}">${data.complaintNumber}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">Title</span>
                <span style="${styles.value}">${data.title}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">New Status</span>
                <span style="${styles.statusBadge(data.status || 'pending')}">${data.status?.replace('_', ' ')}</span>
              </div>
            </div>
            <div style="text-align: center;">
              <a href="${trackingUrl}" style="${styles.button}">View Details</a>
            </div>
          </div>
          <div style="${styles.footer}">
            <p style="${styles.footerText}">PU Unicare - University Maintenance System</p>
          </div>
        </div>
      `,
        },

        escalated: {
            subject: `🚨 ESCALATED: ${data.complaintNumber} - Requires Attention`,
            getHtml: () => `
        <div style="${styles.container}">
          <div style="${styles.header}; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);">
            <h1 style="${styles.headerTitle}">🚨 Complaint Escalated</h1>
            <p style="${styles.headerSubtitle}">Immediate attention required</p>
          </div>
          <div style="${styles.body}">
            <p style="${styles.greeting}">Hi ${recipientName},</p>
            <p style="${styles.message}">
              A complaint has been escalated to Level ${data.escalationLevel || 1} and requires your immediate attention.
              ${data.escalationReason ? `<br><br><strong>Reason:</strong> ${data.escalationReason}` : ''}
            </p>
            <div style="${styles.card}; border-left: 4px solid #dc2626;">
              <div style="${styles.cardTitle}">Escalation Details</div>
              <div style="${styles.row}">
                <span style="${styles.label}">Complaint Number</span>
                <span style="${styles.value}">${data.complaintNumber}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">Title</span>
                <span style="${styles.value}">${data.title}</span>
              </div>
              ${data.departmentName ? `
              <div style="${styles.row}">
                <span style="${styles.label}">Department</span>
                <span style="${styles.value}">${data.departmentName}</span>
              </div>
              ` : ''}
              <div style="${styles.row}">
                <span style="${styles.label}">Escalation Level</span>
                <span style="${styles.priorityBadge('high')}">Level ${data.escalationLevel || 1}</span>
              </div>
              ${data.complainantName ? `
              <div style="${styles.row}">
                <span style="${styles.label}">Complainant</span>
                <span style="${styles.value}">${data.complainantName}</span>
              </div>
              ` : ''}
            </div>
            <div style="text-align: center;">
              <a href="${data.actionUrl || trackingUrl}" style="${styles.button}">Take Action Now</a>
            </div>
          </div>
          <div style="${styles.footer}">
            <p style="${styles.footerText}">⚠️ This complaint requires immediate attention</p>
          </div>
        </div>
      `,
        },

        resolved: {
            subject: `✅ Resolved: ${data.complaintNumber} - Your complaint has been fixed!`,
            getHtml: () => `
        <div style="${styles.container}">
          <div style="${styles.header}; background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
            <h1 style="${styles.headerTitle}">✅ Complaint Resolved</h1>
            <p style="${styles.headerSubtitle}">Your issue has been successfully addressed</p>
          </div>
          <div style="${styles.body}">
            <p style="${styles.greeting}">Hi ${recipientName},</p>
            <p style="${styles.message}">
              Great news! Your complaint has been resolved. We hope the issue has been addressed to your satisfaction.
            </p>
            <div style="${styles.card}; border-left: 4px solid #059669;">
              <div style="${styles.cardTitle}">Resolution Summary</div>
              <div style="${styles.row}">
                <span style="${styles.label}">Complaint Number</span>
                <span style="${styles.value}">${data.complaintNumber}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">Title</span>
                <span style="${styles.value}">${data.title}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">Status</span>
                <span style="${styles.statusBadge('completed')}">Completed</span>
              </div>
              ${data.resolutionNotes ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eaeaf0;">
                <span style="${styles.label}">Resolution Notes</span>
                <p style="margin-top: 8px; color: #1a1a2e; font-size: 14px;">${data.resolutionNotes}</p>
              </div>
              ` : ''}
            </div>
            <p style="${styles.message}">
              Please take a moment to rate our service. Your feedback helps us improve!
            </p>
            <div style="text-align: center;">
              <a href="${trackingUrl}&feedback=true" style="${styles.button}">Rate Our Service ⭐</a>
            </div>
          </div>
          <div style="${styles.footer}">
            <p style="${styles.footerText}">Thank you for using PU Unicare!</p>
          </div>
        </div>
      `,
        },

        feedback_request: {
            subject: `⭐ How did we do? Rate complaint ${data.complaintNumber}`,
            getHtml: () => `
        <div style="${styles.container}">
          <div style="${styles.header}; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);">
            <h1 style="${styles.headerTitle}">⭐ Your Feedback Matters</h1>
            <p style="${styles.headerSubtitle}">Help us improve our service</p>
          </div>
          <div style="${styles.body}">
            <p style="${styles.greeting}">Hi ${recipientName},</p>
            <p style="${styles.message}">
              Your complaint <strong>${data.complaintNumber}</strong> was recently resolved.
              We'd love to hear about your experience!
            </p>
            <div style="${styles.card}">
              <div style="text-align: center; padding: 20px 0;">
                <p style="font-size: 16px; color: #4a4a68; margin-bottom: 16px;">How would you rate our service?</p>
                <div style="font-size: 32px;">
                  <a href="${trackingUrl}&rating=1" style="text-decoration: none;">⭐</a>
                  <a href="${trackingUrl}&rating=2" style="text-decoration: none;">⭐</a>
                  <a href="${trackingUrl}&rating=3" style="text-decoration: none;">⭐</a>
                  <a href="${trackingUrl}&rating=4" style="text-decoration: none;">⭐</a>
                  <a href="${trackingUrl}&rating=5" style="text-decoration: none;">⭐</a>
                </div>
              </div>
            </div>
            <div style="text-align: center;">
              <a href="${trackingUrl}&feedback=true" style="${styles.button}">Submit Detailed Feedback</a>
            </div>
          </div>
          <div style="${styles.footer}">
            <p style="${styles.footerText}">Your feedback helps us serve you better!</p>
          </div>
        </div>
      `,
        },

        reminder: {
            subject: `⏰ Reminder: Complaint ${data.complaintNumber} needs attention`,
            getHtml: () => `
        <div style="${styles.container}">
          <div style="${styles.header}; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);">
            <h1 style="${styles.headerTitle}">⏰ Reminder</h1>
            <p style="${styles.headerSubtitle}">A complaint requires your attention</p>
          </div>
          <div style="${styles.body}">
            <p style="${styles.greeting}">Hi ${recipientName},</p>
            <p style="${styles.message}">
              This is a reminder that complaint <strong>${data.complaintNumber}</strong> is still pending action.
            </p>
            <div style="${styles.card}">
              <div style="${styles.cardTitle}">Complaint Details</div>
              <div style="${styles.row}">
                <span style="${styles.label}">Complaint Number</span>
                <span style="${styles.value}">${data.complaintNumber}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">Title</span>
                <span style="${styles.value}">${data.title}</span>
              </div>
              <div style="${styles.row}">
                <span style="${styles.label}">Status</span>
                <span style="${styles.statusBadge(data.status || 'pending')}">${data.status?.replace('_', ' ')}</span>
              </div>
            </div>
            <div style="text-align: center;">
              <a href="${data.actionUrl || trackingUrl}" style="${styles.button}">Take Action</a>
            </div>
          </div>
          <div style="${styles.footer}">
            <p style="${styles.footerText}">PU Unicare - University Maintenance System</p>
          </div>
        </div>
      `,
        },

        digest: {
            subject: `📊 Your Daily Digest - PU Unicare`,
            getHtml: () => `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h1 style="${styles.headerTitle}">📊 Daily Digest</h1>
            <p style="${styles.headerSubtitle}">Your maintenance overview</p>
          </div>
          <div style="${styles.body}">
            <p style="${styles.greeting}">Hi ${recipientName},</p>
            <p style="${styles.message}">
              Here's your daily summary of maintenance activities.
            </p>
            <div style="text-align: center;">
              <a href="${baseUrl}/dashboard" style="${styles.button}">View Dashboard</a>
            </div>
          </div>
          <div style="${styles.footer}">
            <p style="${styles.footerText}">PU Unicare - University Maintenance System</p>
          </div>
        </div>
      `,
        },
    };

    const template = templates[type];
    return {
        subject: template.subject,
        html: template.getHtml(),
    };
}

// Main email sending function
export async function sendNotificationEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    const { to, type, data, cc } = params;
    const recipients = Array.isArray(to) ? to : [to];

    try {
        for (const recipient of recipients) {
            const { subject, html } = generateEmailContent(type, data, recipient.name);

            // Call the Supabase Edge Function
            const { error } = await supabase.functions.invoke('send-email', {
                body: {
                    to: recipient.email,
                    subject,
                    html,
                    cc: cc?.map(r => r.email),
                },
            });

            if (error) {
                console.error('Failed to send email:', error);
                return { success: false, error: error.message };
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: String(error) };
    }
}

// Convenience functions for common email types
export async function sendComplaintSubmittedEmail(
    complainantEmail: string,
    complainantName: string,
    hodEmail: string,
    hodName: string,
    data: ComplaintEmailData
) {
    // Send to complainant
    await sendNotificationEmail({
        to: { email: complainantEmail, name: complainantName },
        type: 'complaint_submitted',
        data,
    });

    // Send to HOD
    await sendNotificationEmail({
        to: { email: hodEmail, name: hodName },
        type: 'complaint_submitted',
        data: { ...data, actionUrl: `/dashboard/hod/pending` },
    });
}

export async function sendComplaintAssignedEmail(
    complainantEmail: string,
    complainantName: string,
    staffEmail: string,
    staffName: string,
    data: ComplaintEmailData
) {
    // Notify complainant
    await sendNotificationEmail({
        to: { email: complainantEmail, name: complainantName },
        type: 'complaint_assigned',
        data,
    });

    // Notify assigned staff
    await sendNotificationEmail({
        to: { email: staffEmail, name: staffName },
        type: 'complaint_assigned',
        data: { ...data, actionUrl: `/dashboard/maintenance/new-assigned` },
    });
}

export async function sendStatusChangeEmail(
    complainantEmail: string,
    complainantName: string,
    data: ComplaintEmailData
) {
    return sendNotificationEmail({
        to: { email: complainantEmail, name: complainantName },
        type: 'status_changed',
        data,
    });
}

export async function sendEscalationEmail(
    recipients: EmailRecipient[],
    data: ComplaintEmailData
) {
    return sendNotificationEmail({
        to: recipients,
        type: 'escalated',
        data,
    });
}

export async function sendResolutionEmail(
    complainantEmail: string,
    complainantName: string,
    data: ComplaintEmailData
) {
    // Send resolution notification
    await sendNotificationEmail({
        to: { email: complainantEmail, name: complainantName },
        type: 'resolved',
        data,
    });

    // Schedule feedback request (could be done via a delayed job)
    // For now, send immediately
    setTimeout(async () => {
        await sendNotificationEmail({
            to: { email: complainantEmail, name: complainantName },
            type: 'feedback_request',
            data,
        });
    }, 24 * 60 * 60 * 1000); // 24 hours later
}

export async function sendReminderEmail(
    recipientEmail: string,
    recipientName: string,
    data: ComplaintEmailData
) {
    return sendNotificationEmail({
        to: { email: recipientEmail, name: recipientName },
        type: 'reminder',
        data,
    });
}

export default {
    sendNotificationEmail,
    sendComplaintSubmittedEmail,
    sendComplaintAssignedEmail,
    sendStatusChangeEmail,
    sendEscalationEmail,
    sendResolutionEmail,
    sendReminderEmail,
};
