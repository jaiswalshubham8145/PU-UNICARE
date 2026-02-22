/**
 * useEmailNotifications Hook
 * 
 * React hook for sending email/SMS notifications
 * throughout the complaint lifecycle.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    sendNotificationEmail,
    type EmailType,
} from '@/services/EmailNotificationService';
import {
    sendSMS,
    isUserSMSEnabled,
    updateUserSMSPreference,
    type SMSType,
} from '@/services/SMSService';

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
}

interface NotifyParams {
    complaint: {
        complaint_number: string;
        title: string;
        status?: string;
    };
    recipients: Array<{
        email: string;
        name: string;
        phone?: string;
        userId?: string;
    }>;
    type: EmailType;
    additionalData?: Partial<ComplaintEmailData>;
}

// Hook for sending email notifications
export function useSendEmailNotification() {
    return useMutation({
        mutationFn: async (params: NotifyParams) => {
            const { complaint, recipients, type, additionalData } = params;

            const emailData: ComplaintEmailData = {
                complaintNumber: complaint.complaint_number,
                title: complaint.title,
                status: complaint.status,
                ...additionalData,
            };

            // Send emails to all recipients
            for (const recipient of recipients) {
                await sendNotificationEmail({
                    to: { email: recipient.email, name: recipient.name },
                    type,
                    data: emailData,
                });

                // Also send SMS if phone available
                if (recipient.phone && recipient.userId) {
                    const smsEnabled = await isUserSMSEnabled(recipient.userId);
                    if (smsEnabled) {
                        await sendSMS(
                            { phone: recipient.phone, name: recipient.name },
                            type as unknown as SMSType,
                            {
                                complaintNumber: complaint.complaint_number,
                                title: complaint.title,
                                status: complaint.status,
                            }
                        );
                    }
                }
            }

            return { success: true };
        },
        onSuccess: () => {
            // Silent success - don't show toast for every email
        },
        onError: (error) => {
            console.error('Failed to send notification:', error);
        },
    });
}

// Hook for managing SMS preferences
export function useSMSPreferences(userId: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['sms-preferences', userId],
        queryFn: async () => {
            const enabled = await isUserSMSEnabled(userId);
            return { enabled };
        },
        enabled: !!userId,
    });

    const updateMutation = useMutation({
        mutationFn: async ({ enabled, phone }: { enabled: boolean; phone?: string }) => {
            return updateUserSMSPreference(userId, enabled, phone);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sms-preferences', userId] });
            toast.success('SMS preferences updated');
        },
        onError: () => {
            toast.error('Failed to update SMS preferences');
        },
    });

    return {
        isEnabled: query.data?.enabled || false,
        isLoading: query.isLoading,
        updatePreferences: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    };
}

// Unified notification hook for complaint lifecycle
export function useComplaintNotifications() {
    const sendNotification = useSendEmailNotification();

    const notifySubmitted = (
        complaint: { complaint_number: string; title: string },
        complainant: { email: string; name: string; phone?: string },
        hod?: { email: string; name: string }
    ) => {
        const recipients = [complainant];
        if (hod) recipients.push(hod);

        sendNotification.mutate({
            complaint,
            recipients,
            type: 'complaint_submitted',
        });
    };

    const notifyAssigned = (
        complaint: { complaint_number: string; title: string },
        complainant: { email: string; name: string },
        staff: { email: string; name: string }
    ) => {
        sendNotification.mutate({
            complaint,
            recipients: [complainant, staff],
            type: 'complaint_assigned',
            additionalData: { assignedStaffName: staff.name },
        });
    };

    const notifyStatusChange = (
        complaint: { complaint_number: string; title: string; status: string },
        complainant: { email: string; name: string }
    ) => {
        sendNotification.mutate({
            complaint,
            recipients: [complainant],
            type: 'status_changed',
        });
    };

    const notifyEscalated = (
        complaint: { complaint_number: string; title: string },
        recipients: Array<{ email: string; name: string }>,
        level: number,
        reason?: string
    ) => {
        sendNotification.mutate({
            complaint,
            recipients,
            type: 'escalated',
            additionalData: { escalationLevel: level, escalationReason: reason },
        });
    };

    const notifyResolved = (
        complaint: { complaint_number: string; title: string },
        complainant: { email: string; name: string },
        resolutionNotes?: string
    ) => {
        sendNotification.mutate({
            complaint,
            recipients: [complainant],
            type: 'resolved',
            additionalData: { resolutionNotes },
        });
    };

    return {
        notifySubmitted,
        notifyAssigned,
        notifyStatusChange,
        notifyEscalated,
        notifyResolved,
        isLoading: sendNotification.isPending,
    };
}
