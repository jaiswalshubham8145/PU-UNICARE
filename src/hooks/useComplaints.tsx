import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";
import { TABLES } from "@/config/constants";
import { sendComplaintEmail, ComplaintEmailData } from "@/services/emailService";
import autoAssignmentEngine from "@/services/AutoAssignmentEngine";
import { fireCelebrationConfetti } from "@/utils/confetti";
import { PARUL_CAMPUS_BUILDINGS } from "@/data/campusBuildings";

type ComplaintPriority = Database['public']['Enums']['complaint_priority'];
type ComplaintStatus = Database['public']['Enums']['complaint_status'];

interface ComplaintInsert {
  title: string;
  description: string;
  location: string;
  department_id: string;
  category_id: string;
  priority: ComplaintPriority;
  image_urls?: string[];
  building_id?: string;
  latitude?: number;
  longitude?: number;
}

export const useComplaints = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's own complaints
  const { data: myComplaints, isLoading: loadingMyComplaints } = useQuery({
    queryKey: ["my-complaints", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from(TABLES.COMPLAINTS)
        .select(`
          *,
          departments(name),
          maintenance_categories(name),
          buildings(name)
        `)
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch department complaints (for HOD)
  const { data: departmentComplaints, isLoading: loadingDeptComplaints, error: deptError } = useQuery({
    queryKey: ["department-complaints", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from(TABLES.COMPLAINTS)
        .select(`
          *,
          departments(name),
          maintenance_categories(name),
          buildings(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && roles.includes("hod"),
  });

  // Fetch all complaints (for admin)
  const { data: allComplaints, isLoading: loadingAllComplaints } = useQuery({
    queryKey: ["all-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.COMPLAINTS)
        .select(`
          *,
          departments(name),
          maintenance_categories(name),
          buildings(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && (roles.includes("admin") || roles.includes("principal")),
  });

  // Submit new complaint
  const submitComplaint = useMutation({
    mutationFn: async (complaint: ComplaintInsert) => {
      if (!user) throw new Error("Not authenticated");

      // 1. Determine auto-assignment BEFORE inserting
      let assignmentDetails = null;
      try {
        console.log('[SubmitComplaint] Starting auto-assignment determination...');
        console.log('[SubmitComplaint] Category:', complaint.category_id, '| Department:', complaint.department_id, '| Priority:', complaint.priority);
        assignmentDetails = await autoAssignmentEngine.determineAssignment(
          complaint.category_id,
          complaint.department_id,
          complaint.priority
        );
        console.log('[SubmitComplaint] Assignment result:', assignmentDetails ? `Found: ${assignmentDetails.candidate.full_name} (${assignmentDetails.candidate.user_id})` : 'No candidate found');
      } catch (autoAssignError) {
        console.error("[SubmitComplaint] Auto-assignment determination failed:", autoAssignError);
      }

      // Build insert data with auto-assignment results
      const insertData = {
        title: complaint.title,
        description: complaint.description,
        location: complaint.location,
        department_id: complaint.department_id,
        category_id: complaint.category_id,
        priority: complaint.priority,
        image_urls: complaint.image_urls || null,
        building_id: complaint.building_id || null,
        submitted_by: user.id,
        status: assignmentDetails ? 'approved' : 'pending',
        assigned_to: assignmentDetails ? assignmentDetails.candidate.user_id : null,
        is_auto_assigned: !!assignmentDetails,
        latitude: complaint.latitude || null,
        longitude: complaint.longitude || null,
      } as any;

      console.log('[SubmitComplaint] Inserting with status:', insertData.status, '| assigned_to:', insertData.assigned_to);

      const { data, error } = await supabase
        .from(TABLES.COMPLAINTS)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[SubmitComplaint] INSERT failed:', error);
        throw error;
      }

      console.log('[SubmitComplaint] ✅ Complaint inserted:', data.complaint_number, '| Status:', data.status, '| Assigned to:', data.assigned_to);

      // 2. Log and notify assignment if successful
      if (assignmentDetails) {
        try {
          await autoAssignmentEngine.logAndNotifyAssignment(data.id, assignmentDetails);
          console.log(`[SubmitComplaint] ✅ Successfully auto-assigned complaint ${data.complaint_number}`);
        } catch (logError) {
          console.error("[SubmitComplaint] Failed to log/notify assignment:", logError);
        }
      }

      // Fetch category and department names for emails
      const { data: category } = await supabase
        .from(TABLES.MAINTENANCE_CATEGORIES)
        .select("name")
        .eq("id", complaint.category_id)
        .single();

      const { data: department } = await supabase
        .from(TABLES.DEPARTMENTS)
        .select("name")
        .eq("id", complaint.department_id)
        .single();

      const categoryName = category?.name || "Maintenance";
      const departmentName = department?.name || "";

      // Trigger email notification to all relevant parties
      try {
        // Use centralized email service
        const emailData: ComplaintEmailData = {
          id: data.id,
          complaint_number: data.complaint_number,
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          location: data.location,
          department_id: data.department_id,
          submitted_by: data.submitted_by,
          assigned_to: data.assigned_to,
          category_name: categoryName,
          department_name: departmentName,
        };

        sendComplaintEmail("new_complaint", emailData).catch(console.error);
      } catch (emailError) {
        console.error("Failed to trigger email:", emailError);
        // Don't fail the submission if email fails
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["department-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-stats"] });
      fireCelebrationConfetti();
    },
  });

  // Update complaint status (for HOD/Admin)
  const updateComplaintStatus = useMutation({
    mutationFn: async ({
      complaintId,
      status,
      note
    }: {
      complaintId: string;
      status: ComplaintStatus;
      note?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Fetch complaint data before update for email notifications
      const { data: complaintData } = await supabase
        .from(TABLES.COMPLAINTS)
        .select(`
          id, complaint_number, title, description, priority, status,
          location, department_id, submitted_by, assigned_to,
          departments(name), maintenance_categories(name)
        `)
        .eq("id", complaintId)
        .single();

      // Update complaint status
      const { error: updateError } = await supabase
        .from(TABLES.COMPLAINTS)
        .update({ status })
        .eq("id", complaintId);

      if (updateError) throw updateError;

      // Add update record
      const { error: insertError } = await supabase
        .from(TABLES.COMPLAINT_UPDATES)
        .insert({
          complaint_id: complaintId,
          status,
          updated_by: user.id,
          note: note || `Status changed to ${status}`,
        });

      if (insertError) throw insertError;

      // Send email notification based on new status
      if (complaintData) {
        try {
          const emailData: ComplaintEmailData = {
            id: complaintData.id,
            complaint_number: complaintData.complaint_number,
            title: complaintData.title,
            description: complaintData.description,
            priority: complaintData.priority,
            status,
            location: complaintData.location,
            department_id: complaintData.department_id,
            submitted_by: complaintData.submitted_by,
            assigned_to: complaintData.assigned_to,
            department_name: (complaintData.departments as { name: string } | null)?.name,
            category_name: (complaintData.maintenance_categories as { name: string } | null)?.name,
          };

          // Determine email type based on status
          const emailType = status === "rejected" || status === "completed" || status === "in_progress"
            ? "status_update"
            : "status_update";

          sendComplaintEmail(emailType, emailData, {
            updatedByName: user.email || "System",
            note,
          }).catch(console.error);
        } catch (emailError) {
          console.error("Failed to send status update email:", emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["department-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
    },
  });

  return {
    myComplaints,
    departmentComplaints,
    allComplaints,
    loadingMyComplaints,
    loadingDeptComplaints,
    loadingAllComplaints,
    submitComplaint,
    updateComplaintStatus,
    errorDeptComplaints: deptError,
  };
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.DEPARTMENTS)
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_CATEGORIES)
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useBuildings = () => {
  return useQuery<Database['public']['Tables']['buildings']['Row'][]>({
    queryKey: ["buildings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.BUILDINGS)
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.warn("Could not query buildings from remote DB, falling back to verified Parul University campus dataset:", error);
      }

      // Check if DB contains outdated hypothetical entries (e.g. Poultry Farm / Oceanography Block)
      const isLegacyData = data && data.length > 0 && data.some(b => b.name === 'Poultry Farm' || b.name === 'Oceanography Block');

      if (!data || data.length === 0 || isLegacyData) {
        return PARUL_CAMPUS_BUILDINGS.map(b => {
          const matchedDbRow = data?.find(d => d.name.toLowerCase() === b.name.toLowerCase());
          return {
            id: matchedDbRow?.id || b.id,
            name: b.name,
            category: b.category,
            created_at: matchedDbRow?.created_at || new Date().toISOString()
          };
        });
      }

      return data;
    },
  });
};

export const useComplaintByNumber = (complaintNumber: string) => {
  return useQuery({
    queryKey: ["complaint", complaintNumber],
    queryFn: async () => {
      if (!complaintNumber) return null;

      const { data, error } = await supabase
        .from(TABLES.COMPLAINTS)
        .select(`
          *,
          departments(name),
          maintenance_categories(name),
          complaint_updates(*)
        `)
        .eq("complaint_number", complaintNumber.toUpperCase())
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!complaintNumber,
  });
};

export const useComplaintStats = () => {
  const { user, roles } = useAuth();

  return useQuery({
    queryKey: ["complaint-stats", user?.id, roles],
    queryFn: async () => {
      if (!user) return null;

      let query = supabase.from(TABLES.COMPLAINTS).select("status");

      // Filter based on role
      if (!roles.includes("admin") && !roles.includes("principal")) {
        if (roles.includes("hod")) {
          // HOD sees department complaints - filter will be applied by RLS
        } else {
          query = query.eq("submitted_by", user.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(c => c.status === "pending").length,
        acknowledged: data.filter(c => c.status === "acknowledged").length,
        approved: data.filter(c => c.status === "approved").length,
        in_progress: data.filter(c => c.status === "in_progress").length,
        completed: data.filter(c => c.status === "completed").length,
        rejected: data.filter(c => c.status === "rejected").length,
        on_hold: data.filter(c => c.status === "on_hold").length,
        closed: data.filter(c => c.status === "closed").length,
      };

      return stats;
    },
    enabled: !!user,
  });
};
