import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simple mock for supabase - just return promises for all chain methods
const createSimpleMock = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mock: Record<string, any> = {};
    const noop = () => mock;
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

describe('AutoAssignmentEngine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('findBestStaff returns array', async () => {
        const engine = (await import('@/services/AutoAssignmentEngine')).default;
        const result = await engine.findBestStaff('cat-1', 'dept-1', 'medium');
        expect(Array.isArray(result)).toBe(true);
    });

    it('updateStaffSkills is callable', async () => {
        const engine = (await import('@/services/AutoAssignmentEngine')).default;
        await expect(engine.updateStaffSkills('user-1', [])).resolves.not.toThrow();
    });

    it('updateStaffAvailability is callable', async () => {
        const engine = (await import('@/services/AutoAssignmentEngine')).default;
        await expect(engine.updateStaffAvailability('user-1', { status: 'available' })).resolves.not.toThrow();
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
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getEscalationRules returns array', async () => {
        const svc = (await import('@/services/EscalationService')).default;
        const result = await svc.getEscalationRules();
        expect(Array.isArray(result)).toBe(true);
    });

    it('getEscalationCandidates returns array', async () => {
        const svc = (await import('@/services/EscalationService')).default;
        const result = await svc.getEscalationCandidates();
        expect(Array.isArray(result)).toBe(true);
    });

    it('getEscalationStats returns stats', async () => {
        const svc = (await import('@/services/EscalationService')).default;
        const stats = await svc.getEscalationStats();
        expect(stats).toHaveProperty('totalEscalated');
        expect(stats).toHaveProperty('level1Count');
        expect(stats).toHaveProperty('level2Count');
        expect(stats).toHaveProperty('level3Count');
        expect(stats).toHaveProperty('pendingAcknowledgments');
        expect(stats).toHaveProperty('averageTimeToAcknowledge');
    });
});

describe('SMSService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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

    it('updateUserSMSPreference returns success', async () => {
        const { updateUserSMSPreference } = await import('@/services/SMSService');
        const result = await updateUserSMSPreference('user-1', true, '+919876543210');
        expect(result.success).toBe(true);
    });
});
