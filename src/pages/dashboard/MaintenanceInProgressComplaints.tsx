import { TableRowsSkeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, AlertTriangle, UserCheck, Users, TrendingUp, AlertCircle, BarChart3, Loader2, Eye, ArrowLeft, Play, MessageSquare, Pause, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLES } from "@/config/constants";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { format } from "date-fns";
import { useState } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import ProgressUpdateModal from "@/components/complaints/ProgressUpdateModal";
import CompletionProofModal from "@/components/complaints/CompletionProofModal";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { sendComplaintEmail, ComplaintEmailData } from "@/services/emailService";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
    departments: { name: string } | null;
    maintenance_categories: { name: string } | null;
    buildings: { name: string } | null;
    profiles: { full_name: string } | null;
};

const priorityColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-priority-high text-white",
    medium: "bg-warning text-warning-foreground",
    low: "bg-success text-success-foreground",
};

const MaintenanceInProgressComplaints = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
    const [progressComplaint, setProgressComplaint] = useState<ComplaintWithJoins | null>(null);
    const [completionComplaint, setCompletionComplaint] = useState<ComplaintWithJoins | null>(null);

    // Enable real-time updates
    useRealtimeComplaints();

    // Fetch assigned complaints
    const { data: assignedComplaints, isLoading } = useQuery({
        queryKey: ["assigned-complaints", user?.id],
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
                .eq("assigned_to", user.id)
                .eq("status", "in_progress")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    // Update status mutation
    const updateStatus = useMutation({
        mutationFn: async ({ complaintId, status, note }: { complaintId: string; status: string; note?: string }) => {
            if (!user) throw new Error("Not authenticated");

            const { error: updateError } = await supabase
                .from(TABLES.COMPLAINTS)
                .update({ status: status as Database["public"]["Enums"]["complaint_status"] })
                .eq("id", complaintId);

            if (updateError) throw updateError;

            const { error: insertError } = await supabase
                .from(TABLES.COMPLAINT_UPDATES)
                .insert({
                    complaint_id: complaintId,
                    status: status as Database["public"]["Enums"]["complaint_status"],
                    updated_by: user.id,
                    note: note || `Status changed to ${status.replace("_", " ")}`,
                });

            if (insertError) throw insertError;

            // Send email notification
            const complaint = assignedComplaints?.find((c: ComplaintWithJoins) => c.id === complaintId);
            if (complaint) {
                const emailData: ComplaintEmailData = {
                    id: complaint.id,
                    complaint_number: complaint.complaint_number,
                    title: complaint.title,
                    description: complaint.description,
                    priority: complaint.priority,
                    status: status,
                    location: complaint.location,
                    department_id: complaint.department_id,
                    submitted_by: complaint.submitted_by,
                    assigned_to: complaint.assigned_to,
                    department_name: complaint.departments?.name,
                    category_name: complaint.maintenance_categories?.name,
                };
                sendComplaintEmail("work_on_hold", emailData, { note }).catch(console.error);
            }
        },
        onSuccess: () => {
            toast.success("Status updated successfully");
            queryClient.invalidateQueries({ queryKey: ["assigned-complaints"] });
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : "Failed to update status");
        },
    });

    const complaints = (assignedComplaints as unknown as ComplaintWithJoins[]) || [];

    return (
        <div className="relative z-10 min-h-screen transparency-medium noise-texture">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex items-center gap-4">
                        <Link to="/dashboard/maintenance">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">In Progress Tasks</h1>
                            <p className="text-muted-foreground">Tasks you are currently working on</p>
                        </div>
                    </div>

                    <div className="card-elevated p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Play className="w-5 h-5 text-info" />
                            In Progress Tasks ({complaints.length})
                        </h2>
                        {isLoading ? (
                            <div className="py-4"><TableRowsSkeleton rows={4} /></div>
                        ) : complaints.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">No tasks in progress</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {complaints.map((complaint) => (
                                    <div key={complaint.id} className="p-4 rounded-xl border border-border">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-medium text-foreground">{complaint.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {complaint.complaint_number} • {complaint.buildings?.name} • {complaint.location} • {format(new Date(complaint.created_at), "MMM d, yyyy")}
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                                                {complaint.priority}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedComplaint(complaint)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Details
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setProgressComplaint(complaint)}
                                            >
                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                Update
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updateStatus.mutate({ complaintId: complaint.id, status: "on_hold", note: "Task put on hold" })}
                                                disabled={updateStatus.isPending}
                                            >
                                                <Pause className="w-4 h-4 mr-1" />
                                                Hold
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => setCompletionComplaint(complaint)}
                                            >
                                                <Camera className="w-4 h-4 mr-1" />
                                                Complete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />

            {/* Modals */}
            <ComplaintDetailsModal
                complaint={selectedComplaint}
                open={!!selectedComplaint}
                onClose={() => setSelectedComplaint(null)}
            />
            <ProgressUpdateModal
                complaint={progressComplaint}
                open={!!progressComplaint}
                onClose={() => setProgressComplaint(null)}
            />
            <CompletionProofModal
                complaint={completionComplaint}
                open={!!completionComplaint}
                onClose={() => setCompletionComplaint(null)}
            />
        </div>
    );
};

export default MaintenanceInProgressComplaints;