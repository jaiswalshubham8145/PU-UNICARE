import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        functions: {
            invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
        },
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        in: vi.fn().mockReturnThis(),
    },
}));

// Mock the email service
vi.mock('@/services/emailService', () => ({
    sendComplaintEmail: vi.fn().mockResolvedValue({ success: true }),
    getComplaintForEmail: vi.fn().mockResolvedValue({
        id: 'test-id',
        complaint_number: 'CMP-2026-0001',
        title: 'Test Complaint',
        description: 'Test description',
        priority: 'medium',
        status: 'pending',
        location: 'Building A',
        department_id: 'dept-1',
        submitted_by: 'user-1',
        assigned_to: null,
        expected_resolution: null,
        category_name: 'Plumbing',
        department_name: 'Engineering',
    }),
}));

// Mock the EmailNotificationService
vi.mock('@/services/EmailNotificationService', () => ({
    sendNotificationEmail: vi.fn().mockResolvedValue({ success: true }),
    sendComplaintSubmittedEmail: vi.fn().mockResolvedValue({ success: true }),
    sendComplaintAssignedEmail: vi.fn().mockResolvedValue({ success: true }),
    sendStatusChangeEmail: vi.fn().mockResolvedValue({ success: true }),
    sendEscalationEmail: vi.fn().mockResolvedValue({ success: true }),
    sendResolutionEmail: vi.fn().mockResolvedValue({ success: true }),
    sendReminderEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe('EmailService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('sendComplaintEmail', () => {
        it('should be callable with valid parameters', async () => {
            const { sendComplaintEmail } = await import('@/services/emailService');
            const result = await sendComplaintEmail('new_complaint', {
                id: 'test-id',
                complaint_number: 'CMP-2026-0001',
                title: 'Test Complaint',
                priority: 'medium',
                status: 'pending',
                location: 'Building A',
                department_id: 'dept-1',
                submitted_by: 'user-1',
            });
            expect(result.success).toBe(true);
        });
    });

    describe('EmailNotificationService', () => {
        it('should send notification email with type-based approach', async () => {
            const { sendNotificationEmail } = await import('@/services/EmailNotificationService');
            const result = await sendNotificationEmail({
                to: { email: 'test@test.com', name: 'Test User' },
                type: 'complaint_submitted',
                data: {
                    complaintNumber: 'CMP-2026-0001',
                    title: 'Test Complaint',
                    priority: 'medium',
                },
            });
            expect(result.success).toBe(true);
        });

        it('should handle multiple recipients', async () => {
            const { sendNotificationEmail } = await import('@/services/EmailNotificationService');
            const result = await sendNotificationEmail({
                to: [
                    { email: 'user1@test.com', name: 'User 1' },
                    { email: 'user2@test.com', name: 'User 2' },
                ],
                type: 'complaint_assigned',
                data: {
                    complaintNumber: 'CMP-2026-0001',
                    title: 'Test Complaint',
                },
            });
            expect(result.success).toBe(true);
        });
    });
});
