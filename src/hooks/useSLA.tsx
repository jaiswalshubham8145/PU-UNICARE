import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { SLARule, SLATracking, SLAWithRelations, SLATrackingWithRelations } from "@/integrations/supabase/phase1-types";
import { toast } from "sonner";

// Hook to fetch all SLA rules
export const useSLARules = () => {
    return useQuery({
        queryKey: ["sla-rules"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sla_rules")
                .select(`
          *,
          maintenance_categories (
            id,
            name,
            icon
          ),
          departments (
            id,
            name,
            code
          )
        `)
                .eq("is_active", true)
                .order("priority", { ascending: false });

            if (error) throw error;
            return data as unknown as SLAWithRelations[];
        },
    });
};

// Hook to fetch SLA tracking for a complaint
export const useSLATracking = (complaintId: string | undefined) => {
    return useQuery({
        queryKey: ["sla-tracking", complaintId],
        queryFn: async () => {
            if (!complaintId) return null;

            const { data, error } = await supabase
                .from("sla_tracking")
                .select(`
          *,
          sla_rules (
            response_time_hours,
            resolution_time_hours,
            escalation_time_hours
          )
        `)
                .eq("complaint_id", complaintId)
                .single();

            if (error && error.code !== "PGRST116") throw error;
            return data as unknown as SLATrackingWithRelations | null;
        },
        enabled: !!complaintId,
    });
};

// Hook to create or update SLA rule
export const useSaveSLARule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (slaRule: Partial<SLARule> & { id?: string }) => {
            const { id, ...ruleData } = slaRule;

            if (id) {
                // Update existing rule
                const { data, error } = await supabase
                    .from("sla_rules")
                    .update(ruleData)
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Create new rule
                const { data, error } = await supabase
                    .from("sla_rules")
                    .insert(ruleData as Database['public']['Tables']['sla_rules']['Insert'])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sla-rules"] });
            toast.success(variables.id ? "SLA rule updated" : "SLA rule created");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to save SLA rule");
        },
    });
};

// Hook to delete SLA rule (soft delete by setting is_active to false)
export const useDeleteSLARule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ruleId: string) => {
            const { error } = await supabase
                .from("sla_rules")
                .update({ is_active: false })
                .eq("id", ruleId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sla-rules"] });
            toast.success("SLA rule deleted");
        },
    });
};

// Hook to get SLA breach statistics
export interface SLABreachStats {
    total_tracked: number;
    response_breaches: number;
    resolution_breaches: number;
    compliance_rate: number;
}

export const useSLABreachStats = () => {
    return useQuery<SLABreachStats>({
        queryKey: ["sla-breach-stats"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sla_tracking")
                .select("is_response_breached, is_resolution_breached, complaint_id");

            if (error) throw error;

            const stats = {
                total_tracked: data.length,
                response_breaches: data.filter((t) => t.is_response_breached).length,
                resolution_breaches: data.filter((t) => t.is_resolution_breached).length,
                compliance_rate: data.length > 0
                    ? ((data.length - data.filter((t) => t.is_resolution_breached).length) / data.length) * 100
                    : 100,
            };

            return stats;
        },
    });
};

// Hook to get complaints nearing SLA breach
export const useUpcomingSLABreaches = () => {
    return useQuery({
        queryKey: ["upcoming-sla-breaches"],
        queryFn: async () => {
            const now = new Date().toISOString();
            const next4Hours = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from("sla_tracking")
                .select(`
          *,
          complaints (
            id,
            complaint_number,
            title,
            status,
            priority
          )
        `)
                .is("resolved_at", null)
                .gte("resolution_due_at", now)
                .lte("resolution_due_at", next4Hours)
                .eq("is_resolution_breached", false)
                .order("resolution_due_at", { ascending: true });

            if (error) throw error;
            return data;
        },
        refetchInterval: 60000, // Refetch every minute
    });
};

// Hook to calculate SLA time remaining
export const useSLATimeRemaining = (tracking: SLATrackingWithRelations | null) => {
    if (!tracking || !tracking.resolution_due_at || tracking.resolved_at) {
        return null;
    }

    const now = new Date();
    const dueDate = new Date(tracking.resolution_due_at);
    const remainingMs = dueDate.getTime() - now.getTime();

    if (remainingMs < 0) {
        return {
            isOverdue: true,
            hours: 0,
            minutes: 0,
            percentage: 0,
        };
    }

    const totalHours = tracking.sla_rules?.resolution_time_hours || 24;
    const totalMs = totalHours * 60 * 60 * 1000;
    const percentage = (remainingMs / totalMs) * 100;

    return {
        isOverdue: false,
        hours: Math.floor(remainingMs / (60 * 60 * 1000)),
        minutes: Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000)),
        percentage: Math.max(0, Math.min(100, percentage)),
    };
};
