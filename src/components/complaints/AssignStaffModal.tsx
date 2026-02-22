import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLES } from "@/config/constants";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { motion, Variants } from "framer-motion";
import { sendComplaintEmail, ComplaintEmailData } from "@/services/emailService";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
  complaint_updates?: Database['public']['Tables']['complaint_updates']['Row'][];
};

interface AssignStaffModalProps {
  complaint?: ComplaintWithJoins | null;
  open: boolean;
  onClose: () => void;
  onAssign?: (staffId: string) => void;
  complaintId?: string; // Can be "bulk"
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

const AssignStaffModal = ({ complaint, open, onClose, onAssign, complaintId }: AssignStaffModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState("");
  const [expectedResolution, setExpectedResolution] = useState("");
  const [note, setNote] = useState("");
  const [showAllStaff, setShowAllStaff] = useState(false);
  const isBulk = complaintId === "bulk";

  // Fetch maintenance staff
  const { data: maintenanceStaff, isLoading } = useQuery({
    queryKey: ["maintenance-staff", complaint?.department_id, showAllStaff],
    queryFn: async () => {
      // 1. Try to get users with maintenance_staff role
      // Note: This might return empty for HODs due to RLS policies on user_roles table
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "maintenance_staff");

      let staffUserIds: string[] = [];

      // If we found staff via roles, use them to filter
      if (roleData && roleData.length > 0) {
        staffUserIds = roleData.map(r => r.user_id);
      }

      // 2. Query profiles
      let profileQuery = supabase
        .from("profiles")
        .select("user_id, full_name, email, department_id");

      // If we successfully identified staff roles, filter profiles by those IDs
      if (staffUserIds.length > 0) {
        profileQuery = profileQuery.in("user_id", staffUserIds);
      }

      // 3. Filter by department (Required unless "Show All" is checked)
      if (complaint?.department_id && !showAllStaff) {
        profileQuery = profileQuery.eq("department_id", complaint.department_id);
      }

      const { data: profiles, error: profileError } = await profileQuery;

      if (profileError) throw profileError;

      return profiles || [];
    },
    enabled: open,
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (onAssign) {
        onAssign(selectedStaff);
        return;
      }

      if (!user || !selectedStaff || !complaint) throw new Error("Missing required fields");

      // Update complaint with assignment
      const { error: updateError } = await supabase
        .from(TABLES.COMPLAINTS)
        .update({
          assigned_to: selectedStaff,
          approved_by: user.id,
          expected_resolution: expectedResolution || null,
          status: "approved",
        })
        .eq("id", complaint.id);

      if (updateError) throw updateError;

      // Add update record
      const { error: insertError } = await supabase
        .from(TABLES.COMPLAINT_UPDATES)
        .insert({
          complaint_id: complaint.id,
          status: "approved",
          updated_by: user.id,
          note: note || `Assigned to maintenance staff. ${expectedResolution ? `Expected resolution: ${expectedResolution}` : ""}`,
        });

      if (insertError) throw insertError;

      // Trigger email notification to staff and submitter
      try {
        const emailData: ComplaintEmailData = {
          id: complaint.id,
          complaint_number: complaint.complaint_number,
          title: complaint.title,
          description: complaint.description,
          priority: complaint.priority,
          status: "approved",
          location: complaint.location,
          department_id: complaint.department_id,
          submitted_by: complaint.submitted_by,
          assigned_to: selectedStaff,
          expected_resolution: expectedResolution,
          department_name: complaint.departments?.name,
          category_name: complaint.maintenance_categories?.name,
        };

        const staffMember = maintenanceStaff?.find(s => s.user_id === selectedStaff);
        sendComplaintEmail("assignment", emailData, {
          assigneeName: staffMember?.full_name,
          note
        }).catch(console.error);
      } catch (emailError) {
        console.error("Failed to trigger email:", emailError);
      }
    },
    onSuccess: () => {
      if (!onAssign) {
        toast.success("Complaint assigned successfully");
        queryClient.invalidateQueries({ queryKey: ["department-complaints"] });
        queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
        queryClient.invalidateQueries({ queryKey: ["assigned-complaints"] });
      }
      onClose();
      setSelectedStaff("");
      setExpectedResolution("");
      setNote("");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to assign complaint";
      toast.error(message);
    },
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full"
        >
          <motion.div variants={itemVariants}>
            <DialogHeader>
              <DialogTitle>{isBulk ? "Bulk Assign Staff" : "Assign Maintenance Staff"}</DialogTitle>
            </DialogHeader>
          </motion.div>

          <div className="space-y-4 py-4">
            {!isBulk && complaint && (
              <motion.div variants={itemVariants} className="p-3 rounded-lg bg-secondary/50">
                <p className="font-medium text-foreground">{complaint.title}</p>
                <p className="text-sm text-muted-foreground">{complaint.complaint_number}</p>
              </motion.div>
            )}

            {isBulk && (
              <motion.div variants={itemVariants} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400">You are assigning multiple complaints at once.</p>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between">
                <Label>Assign To *</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="show-all" className="text-xs font-normal cursor-pointer">Show all staff</Label>
                  <input
                    id="show-all"
                    type="checkbox"
                    className="accent-primary w-4 h-4 cursor-pointer"
                    checked={showAllStaff}
                    onChange={(e) => setShowAllStaff(e.target.checked)}
                  />
                </div>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                </div>
              ) : maintenanceStaff && maintenanceStaff.length > 0 ? (
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger className="mt-2 text-foreground bg-background hover-luxury border-border">
                    <SelectValue placeholder="Select maintenance staff" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel text-foreground border-white/10">
                    {maintenanceStaff.map((staff: Database['public']['Tables']['profiles']['Row']) => (
                      <SelectItem key={staff.user_id} value={staff.user_id} className="focus:bg-white/10 focus:text-white">
                        {staff.full_name} ({staff.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">No maintenance staff found. Please add maintenance staff first.</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label>Expected Resolution Date</Label>
              <Input
                type="date"
                value={expectedResolution}
                onChange={(e) => setExpectedResolution(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-2 hover-luxury transition-all duration-300"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label>Note (Optional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any notes for the maintenance staff..."
                className="mt-2 hover-luxury transition-all duration-300"
                rows={3}
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} className="hover-luxury">Cancel</Button>
              <Button
                variant="accent"
                onClick={() => assignMutation.mutate()}
                disabled={!selectedStaff || assignMutation.isPending}
                className="hover-luxury"
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  isBulk ? "Assign All" : "Assign & Approve"
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignStaffModal;