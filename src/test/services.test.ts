import { describe, it, expect, vi } from 'vitest';

// Simple mock for supabase
const createSimpleMock = () => {
    const mock: Record<string, any> = {};
    mock.select = vi.fn(() => mock);
    mock.eq = vi.fn(() => mock);
    mock.in = vi.fn(() => mock);
    mock.order = vi.fn(() => mock);
    mock.limit = vi.fn(() => mock);
    mock.gt = vi.fn(() => mock);
    mock.lt = vi.fn(() => mock);
    mock.gte = vi.fn(() => mock);
    mock.lte = vi.fn(() => mock);
    mock.or = vi.fn(() => mock);
    mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
    mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    mock.insert = vi.fn().mockResolvedValue({ data: null, error: null });
    mock.update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });
    mock.delete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });
    mock.upsert = vi.fn().mockResolvedValue({ data: null, error: null });
    return mock;
};

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(() => createSimpleMock()),
        functions: {
            invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
        },
    },
}));

describe('Email Validation', () => {
    it('validates university email correctly', async () => {
        const { isUniversityEmail } = await import('@/lib/emailValidation');
        expect(isUniversityEmail('user@paruluniversity.ac.in')).toBe(true);
        expect(isUniversityEmail('USER@PARULUNIVERSITY.AC.IN')).toBe(true);
        expect(isUniversityEmail('user@gmail.com')).toBe(false);
        expect(isUniversityEmail('')).toBe(false);
    });

    it('returns correct error message', async () => {
        const { getUniversityEmailError } = await import('@/lib/emailValidation');
        const error = getUniversityEmailError();
        expect(error).toContain('paruluniversity.ac.in');
    });
});

describe('AI Service', () => {
    it('detectCategory returns result', async () => {
        const { detectCategory } = await import('@/services/AIService');
        const result = detectCategory('The water tap is leaking in room 101');
        expect(result).toBeDefined();
    });

    it('detectPriority returns priority', async () => {
        const { detectPriority } = await import('@/services/AIService');
        const result = detectPriority('Emergency! Fire in the building');
        expect(result).toBeDefined();
        expect(result.priority).toBeDefined();
    });

    it('generateTitle returns title', async () => {
        const { generateTitle } = await import('@/services/AIService');
        const title = generateTitle('The water tap in room 101 is leaking badly and needs immediate repair');
        expect(title).toBeDefined();
        expect(typeof title).toBe('string');
    });
});

describe('Export Utils', () => {
    it('exportToPDF is a function', async () => {
        const { exportToPDF } = await import('@/lib/exportUtils');
        expect(typeof exportToPDF).toBe('function');
    });
});

describe('SMSService', () => {
    it('sendSMS returns success when no provider', async () => {
        const { sendSMS } = await import('@/services/SMSService');
        const result = await sendSMS(
            { phone: '+919876543210', name: 'Test' },
            'complaint_submitted',
            { complaintNumber: 'CMP-001' }
        );
        expect(result.success).toBe(true);
    });

    it('isUserSMSEnabled returns boolean', async () => {
        const { isUserSMSEnabled } = await import('@/services/SMSService');
        const result = await isUserSMSEnabled('user-1');
        expect(typeof result).toBe('boolean');
    });
});

describe('AutoAssignmentEngine', () => {
    it('findBestStaff returns array', async () => {
        const engine = (await import('@/services/AutoAssignmentEngine')).default;
        const result = await engine.findBestStaff('cat-1', 'dept-1', 'medium');
        expect(Array.isArray(result)).toBe(true);
    });

    it('getAssignmentStats returns stats object', async () => {
        const engine = (await import('@/services/AutoAssignmentEngine')).default;
        const stats = await engine.getAssignmentStats();
        expect(stats).toHaveProperty('totalAutoAssigned');
        expect(stats).toHaveProperty('averageScore');
        expect(stats).toHaveProperty('byReason');
    });
});

describe('EscalationService', () => {
    it('getEscalationRules returns array', async () => {
        const svc = (await import('@/services/EscalationService')).default;
        const result = await svc.getEscalationRules();
        expect(Array.isArray(result)).toBe(true);
    });

    it('getEscalationStats returns stats', async () => {
        const svc = (await import('@/services/EscalationService')).default;
        const stats = await svc.getEscalationStats();
        expect(stats).toHaveProperty('totalEscalated');
        expect(stats).toHaveProperty('level1Count');
        expect(stats).toHaveProperty('level2Count');
        expect(stats).toHaveProperty('level3Count');
    });
});

describe('EmailService', () => {
    it('sendComplaintEmail is callable', async () => {
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
        expect(result).toHaveProperty('success');
    });
});

describe('EmailNotificationService', () => {
    it('sendNotificationEmail is callable', async () => {
        const { sendNotificationEmail } = await import('@/services/EmailNotificationService');
        const result = await sendNotificationEmail({
            to: { email: 'test@test.com', name: 'Test' },
            type: 'complaint_submitted',
            data: {
                complaintNumber: 'CMP-001',
                title: 'Test',
            },
        });
        expect(result).toHaveProperty('success');
    });
});

describe('Theme Hook', () => {
    it('useTheme is exported', async () => {
        const { useTheme } = await import('@/hooks/useTheme');
        expect(typeof useTheme).toBe('function');
    });
});

describe('I18n Hook', () => {
    it('useI18n is exported', async () => {
        const { useI18n } = await import('@/hooks/useI18n');
        expect(typeof useI18n).toBe('function');
    });
});
