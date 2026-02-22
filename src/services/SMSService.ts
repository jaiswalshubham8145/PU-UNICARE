/**
 * SMS Service
 * 
 * Infrastructure for SMS notifications.
 * Ready to integrate with any SMS provider when budget allows.
 * 
 * Supported providers (for future):
 * - Twilio
 * - MSG91
 * - Fast2SMS (free tier in India)
 * - TextLocal
 */

import { supabase } from '@/integrations/supabase/client';

export type SMSType =
    | 'complaint_submitted'
    | 'complaint_assigned'
    | 'status_changed'
    | 'escalated'
    | 'resolved'
    | 'otp'
    | 'reminder';

interface SMSRecipient {
    phone: string;
    name: string;
}

interface SMSData {
    complaintNumber?: string;
    title?: string;
    status?: string;
    otp?: string;
    message?: string;
}

// SMS Templates (short and concise for SMS)
const smsTemplates: Record<SMSType, (data: SMSData) => string> = {
    complaint_submitted: (data) =>
        `PU Unicare: Your complaint ${data.complaintNumber} has been registered. Track at: pu-unicare.vercel.app/track`,

    complaint_assigned: (data) =>
        `PU Unicare: Staff assigned to ${data.complaintNumber}. Work will begin shortly.`,

    status_changed: (data) =>
        `PU Unicare: Complaint ${data.complaintNumber} status: ${data.status?.replace('_', ' ')}`,

    escalated: (data) =>
        `PU Unicare URGENT: ${data.complaintNumber} has been escalated. Immediate attention required.`,

    resolved: (data) =>
        `PU Unicare: Great news! ${data.complaintNumber} has been resolved. Please rate our service.`,

    otp: (data) =>
        `Your PU Unicare OTP is ${data.otp}. Valid for 10 minutes. Do not share.`,

    reminder: (data) =>
        `PU Unicare Reminder: ${data.complaintNumber} needs your attention. Please take action.`,
};

interface SMSConfig {
    provider: 'twilio' | 'msg91' | 'fast2sms' | 'textlocal' | 'none';
    apiKey?: string;
    senderId?: string;
}

// Get SMS configuration from environment or database
async function getSMSConfig(): Promise<SMSConfig> {
    // For now, return 'none' since budget is $0
    // In future, this could read from environment variables or settings table
    return {
        provider: 'none',
    };
}

// Send SMS function (infrastructure ready)
export async function sendSMS(
    recipient: SMSRecipient,
    type: SMSType,
    data: SMSData
): Promise<{ success: boolean; error?: string; queued?: boolean }> {
    const config = await getSMSConfig();

    if (config.provider === 'none') {
        // No SMS provider configured - log and queue for later
        console.log(`[SMS Queue] Would send to ${recipient.phone}: ${smsTemplates[type](data)}`);

        // Store in database for when provider is configured
        try {
            await supabase.from('sms_queue' as any).insert({
                phone: recipient.phone,
                name: recipient.name,
                type,
                message: smsTemplates[type](data),
                status: 'queued',
                created_at: new Date().toISOString(),
            });
            return { success: true, queued: true };
        } catch {
            // Table might not exist yet
            return { success: true, queued: true };
        }
    }

    // Provider-specific implementations (for future)
    switch (config.provider) {
        case 'twilio':
            return sendViaTwilio(recipient.phone, smsTemplates[type](data), config);
        case 'msg91':
            return sendViaMSG91(recipient.phone, smsTemplates[type](data), config);
        case 'fast2sms':
            return sendViaFast2SMS(recipient.phone, smsTemplates[type](data), config);
        default:
            return { success: false, error: 'No SMS provider configured' };
    }
}

// Provider implementations (stubs for now)
async function sendViaTwilio(
    phone: string,
    message: string,
    config: SMSConfig
): Promise<{ success: boolean; error?: string }> {
    // Twilio implementation would go here
    console.log(`[Twilio] Sending to ${phone}: ${message}`);
    return { success: false, error: 'Twilio not configured' };
}

async function sendViaMSG91(
    phone: string,
    message: string,
    config: SMSConfig
): Promise<{ success: boolean; error?: string }> {
    // MSG91 implementation would go here
    console.log(`[MSG91] Sending to ${phone}: ${message}`);
    return { success: false, error: 'MSG91 not configured' };
}

async function sendViaFast2SMS(
    phone: string,
    message: string,
    config: SMSConfig
): Promise<{ success: boolean; error?: string }> {
    // Fast2SMS implementation (Free tier available in India)
    console.log(`[Fast2SMS] Sending to ${phone}: ${message}`);
    return { success: false, error: 'Fast2SMS not configured' };
}

// Convenience functions
export async function sendComplaintSubmittedSMS(recipient: SMSRecipient, complaintNumber: string) {
    return sendSMS(recipient, 'complaint_submitted', { complaintNumber });
}

export async function sendComplaintAssignedSMS(recipient: SMSRecipient, complaintNumber: string) {
    return sendSMS(recipient, 'complaint_assigned', { complaintNumber });
}

export async function sendStatusChangeSMS(recipient: SMSRecipient, complaintNumber: string, status: string) {
    return sendSMS(recipient, 'status_changed', { complaintNumber, status });
}

export async function sendEscalationSMS(recipient: SMSRecipient, complaintNumber: string) {
    return sendSMS(recipient, 'escalated', { complaintNumber });
}

export async function sendResolutionSMS(recipient: SMSRecipient, complaintNumber: string) {
    return sendSMS(recipient, 'resolved', { complaintNumber });
}

export async function sendOTPSMS(recipient: SMSRecipient, otp: string) {
    return sendSMS(recipient, 'otp', { otp });
}

export async function sendReminderSMS(recipient: SMSRecipient, complaintNumber: string) {
    return sendSMS(recipient, 'reminder', { complaintNumber });
}

// Check if SMS is enabled for a user
export async function isUserSMSEnabled(userId: string): Promise<boolean> {
    try {
        const { data } = await supabase
            .from('sms_preferences' as any)
            .select('enabled')
            .eq('user_id', userId)
            .single();

        return data?.enabled || false;
    } catch {
        return false;
    }
}

// Update user SMS preference
export async function updateUserSMSPreference(userId: string, enabled: boolean, phone?: string) {
    try {
        await supabase.from('sms_preferences' as any).upsert({
            user_id: userId,
            enabled,
            phone,
            updated_at: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

export default {
    sendSMS,
    sendComplaintSubmittedSMS,
    sendComplaintAssignedSMS,
    sendStatusChangeSMS,
    sendEscalationSMS,
    sendResolutionSMS,
    sendOTPSMS,
    sendReminderSMS,
    isUserSMSEnabled,
    updateUserSMSPreference,
};
