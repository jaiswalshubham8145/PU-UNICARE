/**
 * useEscalation - React hooks for complaint escalation
 * 
 * Provides hooks for managing escalation rules, viewing escalation
 * candidates, and escalating complaints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import escalationService, {
    EscalationRule,
    EscalationCandidate,
    EscalationHistory
} from '@/services/EscalationService';

/**
 * Hook to fetch escalation rules
 */
export function useEscalationRules() {
    return useQuery<EscalationRule[]>({
        queryKey: ['escalation-rules'],
        queryFn: async () => {
            return escalationService.getEscalationRules();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to create/update escalation rules
 */
export function useSaveEscalationRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (rule: Partial<EscalationRule> & { id?: string }) => {
            if (rule.id) {
                return escalationService.updateEscalationRule(rule.id, rule);
            } else {
                return escalationService.createEscalationRule(rule as Omit<EscalationRule, 'id'>);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
            toast.success('Escalation rule saved successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to save rule: ${error.message}`);
        },
    });
}

/**
 * Hook to delete escalation rule
 */
export function useDeleteEscalationRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return escalationService.deleteEscalationRule(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
            toast.success('Escalation rule deleted');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete rule: ${error.message}`);
        },
    });
}

/**
 * Hook to get complaints that need escalation
 */
export function useEscalationCandidates() {
    const { user, activeRole } = useAuth();

    return useQuery<EscalationCandidate[]>({
        queryKey: ['escalation-candidates'],
        queryFn: async () => {
            return escalationService.getEscalationCandidates();
        },
        enabled: !!user && ['admin', 'hod', 'principal'].includes(activeRole || ''),
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });
}

/**
 * Hook to escalate a complaint
 */
export function useEscalateComplaint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            complaintId,
            reason
        }: {
            complaintId: string;
            reason?: string;
        }) => {
            return escalationService.escalateComplaint(complaintId, reason);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            queryClient.invalidateQueries({ queryKey: ['escalation-candidates'] });
            queryClient.invalidateQueries({ queryKey: ['escalation-history'] });
            toast.success('Complaint escalated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to escalate: ${error.message}`);
        },
    });
}

/**
 * Hook to get escalation history for a complaint
 */
export function useEscalationHistory(complaintId: string | undefined) {
    return useQuery<EscalationHistory[]>({
        queryKey: ['escalation-history', complaintId],
        queryFn: async () => {
            if (!complaintId) return [];
            return escalationService.getEscalationHistory(complaintId);
        },
        enabled: !!complaintId,
    });
}

/**
 * Hook to acknowledge an escalation
 */
export function useAcknowledgeEscalation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (historyId: string) => {
            return escalationService.acknowledgeEscalation(historyId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escalation-history'] });
            queryClient.invalidateQueries({ queryKey: ['escalation-candidates'] });
            toast.success('Escalation acknowledged');
        },
        onError: (error: Error) => {
            toast.error(`Failed to acknowledge: ${error.message}`);
        },
    });
}

/**
 * Hook to get escalation statistics
 */
export function useEscalationStats() {
    const { user, activeRole } = useAuth();

    return useQuery({
        queryKey: ['escalation-stats'],
        queryFn: async () => {
            return escalationService.getEscalationStats();
        },
        enabled: !!user && ['admin', 'hod', 'principal'].includes(activeRole || ''),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Hook to subscribe to real-time escalation updates
 */
export function useRealtimeEscalations() {
    const queryClient = useQueryClient();

    useQuery({
        queryKey: ['realtime-escalations'],
        queryFn: async () => {
            const channel = supabase
                .channel('escalation-updates')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'escalation_history',
                    },
                    () => {
                        queryClient.invalidateQueries({ queryKey: ['escalation-history'] });
                        queryClient.invalidateQueries({ queryKey: ['escalation-candidates'] });
                        queryClient.invalidateQueries({ queryKey: ['escalation-stats'] });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        },
        staleTime: Infinity,
    });
}
