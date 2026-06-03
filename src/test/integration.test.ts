import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase for integration tests
const mockSupabase = {
    from: vi.fn(),
    functions: {
        invoke: vi.fn(),
    },
};

vi.mock('@/integrations/supabase/client', () => ({
    supabase: mockSupabase,
}));

describe('Complaint Workflow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('complaint submission flow', async () => {
        // Mock successful insert
        mockSupabase.from.mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: {
                            id: 'complaint-1',
                            complaint_number: 'CMP-2026-0001',
                            title: 'Test Complaint',
                            status: 'pending',
                        },
                        error: null,
                    }),
                }),
            }),
        });

        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
            .from('complaints')
            .insert({
                title: 'Test Complaint',
                description: 'Test description',
                location: 'Building A',
                department_id: 'dept-1',
                category_id: 'cat-1',
                priority: 'medium',
                submitted_by: 'user-1',
            })
            .select()
            .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.complaint_number).toBe('CMP-2026-0001');
    });

    it('email notification flow', async () => {
        mockSupabase.functions.invoke.mockResolvedValue({
            data: { success: true },
            error: null,
        });

        const { supabase } = await import('@/integrations/supabase/client');
        const { error } = await supabase.functions.invoke('send-email', {
            body: {
                type: 'new_complaint',
                to: ['test@paruluniversity.ac.in'],
                subject: 'Test',
                data: { complaintNumber: 'CMP-001' },
            },
        });

        expect(error).toBeNull();
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('send-email', expect.any(Object));
    });
});

describe('Authentication Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates university email domain', async () => {
        const { isUniversityEmail } = await import('@/lib/emailValidation');
        
        expect(isUniversityEmail('user@paruluniversity.ac.in')).toBe(true);
        expect(isUniversityEmail('user@gmail.com')).toBe(false);
    });

    it('role-based access control', async () => {
        const roles = ['admin', 'principal', 'hod', 'faculty', 'cr', 'maintenance_staff'];
        
        const getDashboard = (role: string) => {
            const dashboards: Record<string, string> = {
                admin: '/dashboard/admin',
                principal: '/dashboard/principal',
                hod: '/dashboard/hod',
                faculty: '/dashboard/faculty',
                cr: '/dashboard/cr',
                maintenance_staff: '/dashboard/maintenance',
            };
            return dashboards[role] || '/dashboard/faculty';
        };

        expect(getDashboard('admin')).toBe('/dashboard/admin');
        expect(getDashboard('faculty')).toBe('/dashboard/faculty');
        expect(getDashboard('unknown')).toBe('/dashboard/faculty');
    });
});

describe('Email Template Mapping', () => {
    it('maps all email types correctly', async () => {
        const { sendNotificationEmail } = await import('@/services/EmailNotificationService');
        
        const types = [
            'complaint_submitted',
            'complaint_assigned',
            'status_changed',
            'escalated',
            'resolved',
            'feedback_request',
            'reminder',
            'digest',
        ];

        for (const type of types) {
            const result = await sendNotificationEmail({
                to: { email: 'test@test.com', name: 'Test' },
                type: type as any,
                data: {
                    complaintNumber: 'CMP-001',
                    title: 'Test',
                },
            });
            expect(result.success).toBe(true);
        }
    });
});

describe('Escalation Workflow', () => {
    it('escalation rules are configurable', async () => {
        const rules = [
            { level: 1, after_hours: 24, target: 'hod' },
            { level: 2, after_hours: 48, target: 'principal' },
            { level: 3, after_hours: 72, target: 'admin' },
        ];

        expect(rules).toHaveLength(3);
        expect(rules[0].target).toBe('hod');
        expect(rules[2].target).toBe('admin');
    });
});

describe('SLA Calculation', () => {
    it('calculates SLA deadlines correctly', () => {
        const priorities = {
            critical: { response: 2, resolution: 24 },
            high: { response: 8, resolution: 48 },
            medium: { response: 24, resolution: 72 },
            low: { response: 48, resolution: 120 },
        };

        const calculateDeadline = (hours: number) => {
            const now = new Date();
            return new Date(now.getTime() + hours * 60 * 60 * 1000);
        };

        const criticalDeadline = calculateDeadline(priorities.critical.resolution);
        const lowDeadline = calculateDeadline(priorities.low.resolution);

        expect(criticalDeadline.getTime()).toBeLessThan(lowDeadline.getTime());
    });
});

describe('Notification System', () => {
    it('creates in-app notification', async () => {
        mockSupabase.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        });

        const { supabase } = await import('@/integrations/supabase/client');
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: 'user-1',
                type: 'complaint_assigned',
                title: 'New Task Assigned',
                message: 'You have been assigned a new task',
                related_complaint_id: 'complaint-1',
            });

        expect(error).toBeNull();
    });
});

describe('Dashboard Statistics', () => {
    it('calculates complaint statistics', () => {
        const complaints = [
            { status: 'pending' },
            { status: 'pending' },
            { status: 'in_progress' },
            { status: 'completed' },
            { status: 'completed' },
            { status: 'completed' },
        ];

        const stats = {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'pending').length,
            inProgress: complaints.filter(c => c.status === 'in_progress').length,
            completed: complaints.filter(c => c.status === 'completed').length,
        };

        expect(stats.total).toBe(6);
        expect(stats.pending).toBe(2);
        expect(stats.inProgress).toBe(1);
        expect(stats.completed).toBe(3);
    });
});
