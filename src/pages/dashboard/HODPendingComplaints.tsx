import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
    Clock,
    CheckCircle,
    Loader2,
    Eye,
    ArrowLeft,
    Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import AssignStaffModal from "@/components/complaints/AssignStaffModal";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import autoAssignmentEngine from "@/services/AutoAssignmentEngine";
import { useQueryClient } from "@tanstack/react-query";
import { sendComplaintEmail, ComplaintEmailData } from "@/services/emailService";

type ComplaintWithJoins =
    Database["public"]["Tables"]["complaints"]["Row"] & {
        departments: { name: string } | null;
        maintenance_categories: { name: string } | null;
        buildings: { name: string } | null;
    };

const priorityColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-priority-high text-white",
    medium: "bg-warning text-warning-foreground",
    low: "bg-success text-success-foreground",
};

const HODPendingComplaints = () => {
    const { user } = useAuth();
    const {
        departmentComplaints = [],
        loadingDeptComplaints,
        updateComplaintStatus
    } = useComplaints();

    const [selectedComplaint, setSelectedComplaint] =
        useState<ComplaintWithJoins | null>(null);
    const [assignComplaint, setAssignComplaint] =
        useState<ComplaintWithJoins | null>(null);
    const [autoAssigningId, setAutoAssigningId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Enable realtime updates
    useRealtimeComplaints();

    // ✅ SAFE + OPTIMIZED FILTER
    const pendingComplaints = useMemo(() => {
        return (departmentComplaints as unknown as ComplaintWithJoins[]).filter(
            (c) => c.status === "pending"
        );
    }, [departmentComplaints]);

    const handleApprove = (complaint: ComplaintWithJoins) => {
        setAssignComplaint(complaint);
    };

    const handleReject = async (complaintId: string) => {
        try {
            await updateComplaintStatus.mutateAsync({
                complaintId,
                status: "rejected",
                note: "Rejected by HOD",
            });
            toast.success("Complaint rejected successfully");
        } catch (error: unknown) {
            toast.error("Failed to reject complaint", {
                description:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    const handleAutoAssign = async (complaint: ComplaintWithJoins) => {
        setAutoAssigningId(complaint.id);
        try {
            const result = await autoAssignmentEngine.autoAssign(
                complaint.id,
                complaint.category_id,
                complaint.department_id,
                complaint.priority
            );

            if (result) {
                toast.success("Complaint auto-assigned successfully!", {
                    description: `Assigned based on: ${result.assignment_reason} (Score: ${result.total_score})`,
                });

                // Send assignment email
                try {
                    const emailData: ComplaintEmailData = {
                        id: complaint.id,
                        complaint_number: complaint.complaint_number,
                        title: complaint.title,
                        description: complaint.description,
                        priority: complaint.priority,
                        status: 'approved',
                        location: complaint.location,
                        department_id: complaint.department_id,
                        submitted_by: complaint.submitted_by,
                        assigned_to: result.assigned_to_user_id,
                        department_name: complaint.departments?.name || undefined,
                        category_name: complaint.maintenance_categories?.name || undefined,
                    };
                    sendComplaintEmail("assignment", emailData, {
                        note: `Auto-assigned: ${result.assignment_reason}`,
                    }).catch(console.error);
                } catch (emailErr) {
                    console.error("Failed to send assignment email:", emailErr);
                }

                queryClient.invalidateQueries({ queryKey: ["department-complaints"] });
                queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
                queryClient.invalidateQueries({ queryKey: ["assigned-complaints"] });
                queryClient.invalidateQueries({ queryKey: ["complaint-stats"] });
            } else {
                toast.warning("No available staff found", {
                    description: "No maintenance staff is currently available in this department. Please assign manually.",
                });
            }
        } catch (error: unknown) {
            toast.error("Auto-assignment failed", {
                description: error instanceof Error ? error.message : "Unknown error",
            });
        } finally {
            setAutoAssigningId(null);
        }
    };

    return (
        <div className="relative z-10 min-h-screen transparency-medium noise-texture">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex items-center gap-4">
                        <Link to="/dashboard/hod">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                                Pending Approval Complaints
                            </h1>
                            <p className="text-muted-foreground">
                                Complaints awaiting your approval
                            </p>
                        </div>
                    </div>

                    <div className="card-elevated p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-warning" />
                            Pending Approvals ({pendingComplaints.length})
                        </h2>

                        {loadingDeptComplaints ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                            </div>
                        ) : pendingComplaints.length === 0 ? (
                            <div className="text-center py-10">
                                <CheckCircle className="w-12 h-12 text-success/40 mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    No pending approvals found
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingComplaints.map((complaint) => (
                                    <div
                                        key={complaint.id}
                                        className="p-4 rounded-xl border border-border bg-background/60"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-semibold">
                                                    {complaint.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {complaint.complaint_number}
                                                    {" • "}
                                                    {complaint.buildings?.name || "—"}
                                                    {" • "}
                                                    {complaint.location}
                                                    {" • "}
                                                    {format(
                                                        new Date(complaint.created_at),
                                                        "MMM d, yyyy"
                                                    )}
                                                </div>
                                            </div>

                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[
                                                    complaint.priority as keyof typeof priorityColors
                                                ]
                                                    }`}
                                            >
                                                {complaint.priority}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => handleApprove(complaint)}
                                                disabled={updateComplaintStatus.isPending || autoAssigningId === complaint.id}
                                            >
                                                Approve & Assign
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="accent"
                                                onClick={() => handleAutoAssign(complaint)}
                                                disabled={updateComplaintStatus.isPending || autoAssigningId === complaint.id}
                                            >
                                                {autoAssigningId === complaint.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                        Assigning...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-4 h-4 mr-1" />
                                                        Auto-Assign
                                                    </>
                                                )}
                                            </Button>

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
                                                variant="ghost"
                                                className="text-destructive"
                                                onClick={() => handleReject(complaint.id)}
                                                disabled={updateComplaintStatus.isPending}
                                            >
                                                Reject
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

            <ComplaintDetailsModal
                complaint={selectedComplaint}
                open={!!selectedComplaint}
                onClose={() => setSelectedComplaint(null)}
            />

            <AssignStaffModal
                complaint={assignComplaint}
                open={!!assignComplaint}
                onClose={() => setAssignComplaint(null)}
            />
        </div>
    );
};

export default HODPendingComplaints;
