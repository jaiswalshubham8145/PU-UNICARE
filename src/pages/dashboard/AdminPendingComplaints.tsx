import { TableRowsSkeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
    Clock,
    CheckCircle,
    Loader2,
    Eye,
    ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import type { ComplaintWithJoins } from "@/types/complaint";
import { priorityColors } from "@/utils/complaintStatus";





const AdminPendingComplaints = () => {
    const { user } = useAuth();
    const { allComplaints = [], loadingAllComplaints } = useComplaints();
    const [selectedComplaint, setSelectedComplaint] =
        useState<ComplaintWithJoins | null>(null);

    // Enable realtime updates
    useRealtimeComplaints();

    // ✅ SAFE + MEMOIZED FILTER
    const pendingComplaints = useMemo(() => {
        return (allComplaints as ComplaintWithJoins[]).filter(
            (c) => c.status === "pending"
        );
    }, [allComplaints]);

    return (
        <div className="relative z-10 min-h-screen transparency-medium noise-texture">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex items-center gap-4">
                        <Link to="/dashboard/admin">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                                Pending Complaints
                            </h1>
                            <p className="text-muted-foreground">
                                Complaints awaiting approval or assignment
                            </p>
                        </div>
                    </div>

                    <div className="card-elevated p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-warning" />
                            Pending Complaints ({pendingComplaints.length})
                        </h2>

                        {loadingAllComplaints ? (
                            <div className="py-4"><TableRowsSkeleton rows={4} /></div>
                        ) : pendingComplaints.length === 0 ? (
                            <div className="text-center py-10">
                                <CheckCircle className="w-12 h-12 text-success/40 mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    No pending complaints found
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

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedComplaint(complaint)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Details
                                        </Button>
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
        </div>
    );
};

export default AdminPendingComplaints;
