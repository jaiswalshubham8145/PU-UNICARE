import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { TABLES } from "@/config/constants";

export const useRealtimeComplaints = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Determine filter based on role - similar to query logic
    let filter = undefined;
    if (!roles.includes("admin") && !roles.includes("principal") && !roles.includes("hod")) {
      // Regular users only see their own updates
      filter = `submitted_by=eq.${user.id}`;
    }
    // HODs, Admins see all (or department specific, but row level security handles the data access, 
    // we just want to avoid unnecessary invalidations for irrelevant events)

    // For now, we subscribe to all if admin/hod, or user specific if student.
    // Ideally we would filter by department for HOD, but that requires more complex setup.

    const channel = supabase
      .channel("complaints-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLES.COMPLAINTS,
          filter: filter,
        },
        () => {
          // Invalidate all complaint-related queries when changes occur
          queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
          queryClient.invalidateQueries({ queryKey: ["department-complaints"] });
          queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
          queryClient.invalidateQueries({ queryKey: ["assigned-complaints"] });
          queryClient.invalidateQueries({ queryKey: ["complaint-stats"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLES.COMPLAINT_UPDATES,
          // filtered by complaint ID which we don't have here easily without subscribing to many channels.
          // keeping it global for updates is acceptable for now given lower volume of updates vs inserts.
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["complaint"] });
          queryClient.invalidateQueries({ queryKey: ["complaint-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user, roles]);
};

export default useRealtimeComplaints;