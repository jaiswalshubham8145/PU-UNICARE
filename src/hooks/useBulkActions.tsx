import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];

export const useBulkActions = () => {
    const queryClient = useQueryClient();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Toggle selection for a single item
    const toggleSelection = useCallback((id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                const newSelection = prev.filter((item) => item !== id);
                if (newSelection.length === 0) setIsSelectionMode(false);
                return newSelection;
            } else {
                setIsSelectionMode(true);
                return [...prev, id];
            }
        });
    }, []);

    // Select all visible items
    const selectAll = useCallback((ids: string[]) => {
        setSelectedIds(ids);
        setIsSelectionMode(true);
    }, []);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedIds([]);
        setIsSelectionMode(false);
    }, []);

    // Bulk Status Update
    const updateStatusMutation = useMutation({
        mutationFn: async ({ status }: { status: string }) => {
            const { error } = await supabase
                .from("complaints")
                .update({ status: status as ComplaintStatus })
                .in("id", selectedIds);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success(`Updated ${selectedIds.length} complaints`);
            queryClient.invalidateQueries({ queryKey: ["complaints"] });
            clearSelection();
        },
        onError: (error) => {
            toast.error("Failed to update complaints: " + error.message);
        },
    });

    // Bulk Assign
    const assignMutation = useMutation({
        mutationFn: async ({ staffId }: { staffId: string }) => {
            const { error } = await supabase
                .from("complaints")
                .update({ assigned_to: staffId, status: "approved" })
                .in("id", selectedIds);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success(`Assigned ${selectedIds.length} complaints`);
            queryClient.invalidateQueries({ queryKey: ["complaints"] });
            clearSelection();
        },
        onError: (error) => {
            toast.error("Failed to assign complaints: " + error.message);
        },
    });

    // Bulk Delete
    const deleteMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from("complaints")
                .delete()
                .in("id", selectedIds);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success(`Deleted ${selectedIds.length} complaints`);
            queryClient.invalidateQueries({ queryKey: ["complaints"] });
            clearSelection();
        },
        onError: (error) => {
            toast.error("Failed to delete complaints: " + error.message);
        },
    });

    return {
        selectedIds,
        isSelectionMode,
        toggleSelection,
        selectAll,
        clearSelection,
        updateStatus: updateStatusMutation.mutate,
        isUpdatingStatus: updateStatusMutation.isPending,
        assignTo: assignMutation.mutate,
        isAssigning: assignMutation.isPending,
        deleteComplaints: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        isLoading:
            updateStatusMutation.isPending ||
            assignMutation.isPending ||
            deleteMutation.isPending
    };
};
