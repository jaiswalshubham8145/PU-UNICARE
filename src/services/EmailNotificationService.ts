/**
 * Email Notification Service
 * 
 * Centralized email service for all complaint lifecycle events.
 * Uses type-based sending - the edge function handles HTML generation.
 * 
 * Maps high-level email types to edge function templates:
 * - complaint_submitted -> new_complaint template
 * - complaint_assigned -> assignment template
 * - status_changed -> status_update template
 * - escalated -> escalated template
 * - resolved -> completion template
 * - feedback_request -> feedback_request template
 * - reminder -> reminder template
 * - digest -> digest template
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

// Map our high-level types to edge function template types
function mapToEdgeType(type: EmailType): string {
    const typeMap: Record<EmailType, string> = {
        complaint_submitted: 'complaint_submitted',
        complaint_assigned: 'complaint_assigned',
        status_changed: 'status_update',
        escalated: 'escalated',
        resolved: 'resolved',
        feedback_request: 'feedback_request',
        reminder: 'reminder',
        digest: 'digest',
    };
    return typeMap[type] || type;
}

// Generate subject line based on type
function generateSubject(type: EmailType, data: ComplaintEmailData): string {
    const subjects: Record<EmailType, string> = {
        complaint_submitted: `Complaint Registered: ${data.complaintNumber}`,
        complaint_assigned: `Staff Assigned: ${data.complaintNumber}`,
        status_changed: `Status Update: ${data.complaintNumber} - ${data.status?.replace('_', ' ') || 'Updated'}`,
        escalated: `ESCALATED: ${data.complaintNumber} - Requires Attention`,
        resolved: `Resolved: ${data.complaintNumber} - Your complaint has been fixed!`,
        feedback_request: `How did we do? Rate complaint ${data.complaintNumber}`,
        reminder: `Reminder: Complaint ${data.complaintNumber} needs attention`,
        digest: `Your Daily Digest - PU Unicare`,
    };
    return subjects[type] || `Complaint Update: ${data.complaintNumber}`;
}

// Main email sending function - uses type-based edge function
export async function sendNotificationEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    const { to, type, data } = params;
    const recipients = Array.isArray(to) ? to : [to];

    try {
        const edgeType = mapToEdgeType(type);
        const subject = generateSubject(type, data);

        // Build the data payload matching what the edge function templates expect
        const emailData: Record<string, unknown> = {
            complaintNumber: data.complaintNumber,
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            status: data.status,
            location: data.location,
            departmentName: data.departmentName,
            assignedStaffName: data.assignedStaffName,
            complainantName: data.complainantName,
            escalationLevel: data.escalationLevel,
            escalationReason: data.escalationReason,
            resolutionNotes: data.resolutionNotes,
            trackingUrl: data.trackingUrl,
            actionUrl: data.actionUrl,
        };

        // Collect all unique email addresses
        const emailAddresses = [...new Set(recipients.map(r => r.email).filter(Boolean))];

        if (emailAddresses.length === 0) {
            console.warn('No email recipients for notification:', type);
            return { success: true };
        }

        // Send to edge function using type-based approach
        const { error } = await supabase.functions.invoke('send-email', {
            body: {
                type: edgeType,
                to: emailAddresses,
                subject,
                data: emailData,
            },
        });

        if (error) {
            console.error('Failed to send email:', error);
            return { success: false, error: error.message };
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
        data,
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
        data: { ...data, assignedStaffName: staffName },
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
    // Send resolution notification immediately
    await sendNotificationEmail({
        to: { email: complainantEmail, name: complainantName },
        type: 'resolved',
        data,
    });

    // Schedule feedback request via database (server-side cron handles the delay)
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from('scheduled_emails' as any).insert({
            recipient_email: complainantEmail,
            recipient_name: complainantName,
            type: 'feedback_request',
            complaint_data: JSON.stringify(data),
            scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled',
        });
    } catch {
        // Table may not exist - fallback: send feedback request immediately
        console.log('scheduled_emails table not found, sending feedback request immediately');
        await sendNotificationEmail({
            to: { email: complainantEmail, name: complainantName },
            type: 'feedback_request',
            data,
        });
    }
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
