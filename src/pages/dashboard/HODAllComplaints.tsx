import { TableRowsSkeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, AlertTriangle, UserCheck, Users, TrendingUp, AlertCircle, BarChart3, Loader2, Eye, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { format } from "date-fns";
import { useState } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import type { ComplaintWithJoins } from "@/types/complaint";
import { priorityColors, statusColors } from "@/utils/complaintStatus";






const HODAllComplaints = () => {
    const { user } = useAuth();
    const { departmentComplaints, loadingDeptComplaints } = useComplaints();
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);

    // Enable real-time updates
    useRealtimeComplaints();

    const allComplaints = (departmentComplaints as unknown as ComplaintWithJoins[]) || [];

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
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">All Complaints</h1>
                            <p className="text-muted-foreground">Complete list of all complaints in your department</p>
                        </div>
                    </div>

                    <div className="card-elevated p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            All Complaints ({allComplaints.length})
                        </h2>
                        {loadingDeptComplaints ? (
                            <div className="py-4"><TableRowsSkeleton rows={4} /></div>
                        ) : allComplaints.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">No complaints found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allComplaints.map((complaint) => (
                                    <div key={complaint.id} className="p-4 rounded-xl border border-border">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-medium text-foreground">{complaint.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {complaint.complaint_number} • {complaint.buildings?.name} • {complaint.location} • {format(new Date(complaint.created_at), "MMM d, yyyy")}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                                                    {complaint.priority}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status as keyof typeof statusColors] || "bg-secondary text-secondary-foreground"}`}>
                                                    {complaint.status.replace("_", " ")}
                                                </span>
                                            </div>
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
        </div>
    );
};

export default HODAllComplaints;