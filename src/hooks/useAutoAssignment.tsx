/**
 * useAutoAssignment - React hooks for intelligent staff assignment
 * 
 * Provides hooks for auto-assigning complaints, managing staff skills,
 * and viewing assignment statistics.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import autoAssignmentEngine, {
    StaffCandidate,
    StaffSkill,
    StaffAvailability,
    AssignmentLog
} from '@/services/AutoAssignmentEngine';

/**
 * Hook to find best available staff for a complaint
 */
export function useStaffCandidates(
    categoryId: string | undefined,
    departmentId: string | undefined,
    priority?: string
) {
    return useQuery<StaffCandidate[]>({
        queryKey: ['staff-candidates', categoryId, departmentId, priority],
        queryFn: async () => {
            if (!categoryId || !departmentId) return [];
            return autoAssignmentEngine.findBestStaff(categoryId, departmentId, priority);
        },
        enabled: !!categoryId && !!departmentId,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook to auto-assign a complaint
 */
export function useAutoAssignComplaint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            complaintId,
            categoryId,
            departmentId,
            priority,
        }: {
            complaintId: string;
            categoryId: string;
            departmentId: string;
            priority?: string;
        }): Promise<AssignmentLog | null> => {
            return autoAssignmentEngine.autoAssign(complaintId, categoryId, departmentId, priority);
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
            if (result) {
                toast.success(`Automatically assigned to best available staff`);
            } else {
                toast.warning('No available staff found for auto-assignment');
            }
        },
        onError: (error: Error) => {
            toast.error(`Auto-assignment failed: ${error.message}`);
        },
    });
}

/**
 * Hook to get staff skills
 */
export function useStaffSkills(userId?: string) {
    return useQuery<StaffSkill[]>({
        queryKey: ['staff-skills', userId],
        queryFn: async () => {
            const query = supabase
                .from('staff_skills')
                .select(`
          *,
          maintenance_categories(name)
        `)
                .order('proficiency_level', { ascending: false });

            if (userId) {
                query.eq('user_id', userId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!userId,
    });
}

/**
 * Hook to update staff skills
 */
export function useUpdateStaffSkills() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            skills,
        }: {
            userId: string;
            skills: Array<{
                category_id: string;
                skill_name: string;
                proficiency_level: number;
                is_primary: boolean;
            }>;
        }) => {
            return autoAssignmentEngine.updateStaffSkills(userId, skills);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['staff-skills', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['staff-candidates'] });
            toast.success('Skills updated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update skills: ${error.message}`);
        },
    });
}

/**
 * Hook to get staff availability
 */
export function useStaffAvailability(userId?: string) {
    return useQuery<StaffAvailability | null>({
        queryKey: ['staff-availability', userId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('staff_availability')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        },
        enabled: !!userId,
    });
}

/**
 * Hook to get all staff availability (for admins/HODs)
 */
export function useAllStaffAvailability() {
    const { activeRole } = useAuth();

    return useQuery<(StaffAvailability & { profile: { full_name: string; email: string } })[]>({
        queryKey: ['all-staff-availability'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('staff_availability')
                .select(`
          *,
          profile:profiles(full_name, email)
        `)
                .order('status', { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: ['admin', 'hod', 'principal'].includes(activeRole || ''),
        refetchInterval: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook to update staff availability
 */
export function useUpdateStaffAvailability() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (availability: Partial<StaffAvailability>) => {
            if (!user?.id) throw new Error('Not authenticated');
            return autoAssignmentEngine.updateStaffAvailability(user.id, availability);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
            queryClient.invalidateQueries({ queryKey: ['all-staff-availability'] });
            queryClient.invalidateQueries({ queryKey: ['staff-candidates'] });
            toast.success('Availability updated');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update availability: ${error.message}`);
        },
    });
}

/**
 * Hook to get assignment statistics
 */
export function useAssignmentStats() {
    const { activeRole } = useAuth();

    return useQuery({
        queryKey: ['assignment-stats'],
        queryFn: async () => {
            return autoAssignmentEngine.getAssignmentStats();
        },
        enabled: ['admin', 'hod', 'principal'].includes(activeRole || ''),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to get assignment logs
 */
export function useAssignmentLogs(complaintId?: string) {
    return useQuery({
        queryKey: ['assignment-logs', complaintId],
        queryFn: async () => {
            let query = supabase
                .from('auto_assignment_logs')
                .select(`
          *,
          assigned_to:profiles!assigned_to_user_id(full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (complaintId) {
                query = query.eq('complaint_id', complaintId);
            }

            const { data, error } = await query.limit(50);
            if (error) throw error;
            return data || [];
        },
    });
}

/**
 * Hook to get staff shifts
 */
export function useStaffShifts(userId?: string, date?: Date) {
    return useQuery({
        queryKey: ['staff-shifts', userId, date?.toISOString()],
        queryFn: async () => {
            let query = supabase
                .from('staff_shifts')
                .select(`
          *,
          user:profiles!user_id(full_name),
          backup:profiles!backup_user_id(full_name)
        `)
                .order('shift_date', { ascending: true });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            if (date) {
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);

                query = query
                    .gte('shift_date', startOfWeek.toISOString().split('T')[0])
                    .lte('shift_date', endOfWeek.toISOString().split('T')[0]);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
    });
}

/**
 * Hook to create/update staff shift
 */
export function useSaveStaffShift() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (shift: {
            id?: string;
            user_id: string;
            shift_date: string;
            shift_start: string;
            shift_end: string;
            shift_type?: string;
            is_leave?: boolean;
            leave_type?: string;
            backup_user_id?: string;
            notes?: string;
        }) => {
            if (shift.id) {
                const { data, error } = await supabase
                    .from('staff_shifts')
                    .update(shift)
                    .eq('id', shift.id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase
                    .from('staff_shifts')
                    .insert(shift)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
            toast.success('Shift saved successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to save shift: ${error.message}`);
        },
    });
}
