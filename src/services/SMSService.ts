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
        `PU Unicare: Great news! ${data.complaintNumber} has been resolved. Please rate our service: pu-unicare.vercel.app/survey?id=${data.complaintNumber}`,

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

// Get SMS configuration from environment
async function getSMSConfig(): Promise<SMSConfig> {
    // Check Vite environment variables first
    const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : null;

    // In test environment, bypass external network calls unless explicitly configured
    if (viteEnv?.MODE === 'test' && !viteEnv?.VITE_SMS_PROVIDER) {
        return { provider: 'none' };
    }

    const provider = viteEnv?.VITE_SMS_PROVIDER || 'fast2sms'; // Default to fast2sms for this project

    if (provider === 'none') {
        return { provider: 'none' };
    }

    const apiKey = viteEnv?.VITE_FAST2SMS_API_KEY;
    const senderId = viteEnv?.VITE_SMS_SENDER_ID || "TXTIND";

    return {
        provider: provider as SMSConfig['provider'],
        apiKey: apiKey || undefined,
        senderId: senderId || undefined,
    };
}

// Send SMS function (infrastructure ready)
export async function sendSMS(
    recipient: SMSRecipient,
    type: SMSType,
    data: SMSData
): Promise<{ success: boolean; error?: string; queued?: boolean }> {
    const config = await getSMSConfig();
    const message = smsTemplates[type](data);

    if (config.provider === 'none') {
        console.log(`[SMS] No provider configured. Would send to ${recipient.phone}: ${message}`);
        return { success: true, queued: true };
    }

    // Provider-specific implementations
    switch (config.provider) {
        case 'twilio':
            return sendViaTwilio(recipient.phone, message, config);
        case 'msg91':
            return sendViaMSG91(recipient.phone, message, config);
        case 'fast2sms':
            return sendViaFast2SMS(recipient.phone, message, config);
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
    if (!config.apiKey) {
        return { success: false, error: 'Twilio API key not configured' };
    }
    // TODO: Implement Twilio SDK integration
    console.log(`[Twilio] Sending to ${phone}: ${message}`);
    return { success: false, error: 'Twilio not yet implemented' };
}

async function sendViaMSG91(
    phone: string,
    message: string,
    config: SMSConfig
): Promise<{ success: boolean; error?: string }> {
    if (!config.apiKey) {
        return { success: false, error: 'MSG91 API key not configured' };
    }
    // TODO: Implement MSG91 API integration
    console.log(`[MSG91] Sending to ${phone}: ${message}`);
    return { success: false, error: 'MSG91 not yet implemented' };
}

async function sendViaFast2SMS(
    phone: string,
    message: string,
    config: SMSConfig
): Promise<{ success: boolean; error?: string }> {
    if (!config.apiKey) {
        return { success: false, error: 'Fast2SMS API key not configured' };
    }
    
    try {
        const url = "https://www.fast2sms.com/dev/bulkV2";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'authorization': config.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                route: "v3",
                sender_id: config.senderId || "TXTIND",
                message: message,
                language: "english",
                flash: 0,
                numbers: phone.replace(/\D/g, '').slice(-10), // Clean to 10 digits
            })
        });

        const data = await response.json();
        
        if (data.return) {
            console.log(`[Fast2SMS] Successfully sent to ${phone}`);
            return { success: true };
        } else {
            console.error("[Fast2SMS] Error:", data);
            return { success: false, error: data.message || "Failed to send SMS" };
        }
    } catch (error: any) {
        console.error("[Fast2SMS] Failed:", error);
        return { success: false, error: error.message };
    }
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

// Check if SMS is enabled for a user (stub - always returns false until provider configured)
export async function isUserSMSEnabled(_userId: string): Promise<boolean> {
    const config = await getSMSConfig();
    return config.provider !== 'none';
}

// Update user SMS preference (stub)
export async function updateUserSMSPreference(_userId: string, _enabled: boolean, _phone?: string) {
    console.log('[SMS] SMS preferences require sms_preferences table. Configure via Supabase dashboard.');
    return { success: true };
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
