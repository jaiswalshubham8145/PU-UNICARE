import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationWithComplaint } from "@/integrations/supabase/phase1-types";
import { toast } from "sonner";
import { useEffect } from "react";

// Hook to fetch user notifications
export const useNotifications = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["notifications", userId],
        queryFn: async () => {
            if (!userId) return [];

            const { data, error } = await supabase
                .from("notifications")
                .select(`
          *,
          complaints:related_complaint_id (
            complaint_number,
            title,
            status
          )
        `)
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;
            return data as unknown as NotificationWithComplaint[];
        },
        enabled: !!userId,
    });
};

// Hook for unread notification count
export const useUnreadNotificationCount = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["notifications-unread-count", userId],
        queryFn: async () => {
            if (!userId) return 0;

            const { count, error } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("is_read", false);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!userId,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

// Mark notification as read
export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq("id", notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
        },
    });
};

// Mark all notifications as read
export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq("user_id", userId)
                .eq("is_read", false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
            toast.success("All notifications marked as read");
        },
    });
};

// Delete notification
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
            toast.success("Notification deleted");
        },
    });
};

// Real-time subscription for notifications
export const useRealtimeNotifications = (userId: string | undefined) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel("notifications")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });

                    // Show toast for new notification
                    const notification = payload.new as Notification;
                    toast(notification.title, {
                        description: notification.message,
                        action: notification.link
                            ? {
                                label: "View",
                                onClick: () => {
                                    window.location.href = notification.link!;
                                },
                            }
                            : undefined,
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, queryClient]);
};
