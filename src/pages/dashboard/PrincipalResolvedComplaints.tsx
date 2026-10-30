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

const PrincipalResolvedComplaints = () => {
    const { user } = useAuth();
    const { allComplaints, loadingAllComplaints } = useComplaints();
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);

    // Enable real-time updates
    useRealtimeComplaints();

    const resolvedComplaints = (allComplaints as unknown as ComplaintWithJoins[])?.filter((c) => c.status === "completed" || c.status === "closed") || [];

    return (
        <div className="relative z-10 min-h-screen transparency-medium noise-texture">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex items-center gap-4">
                        <Link to="/dashboard/principal">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Resolved Complaints</h1>
                            <p className="text-muted-foreground">All completed and closed complaints</p>
                        </div>
                    </div>

                    <div className="card-elevated p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-success" />
                            Resolved Complaints ({resolvedComplaints.length})
                        </h2>
                        {loadingAllComplaints ? (
                            <div className="py-4"><TableRowsSkeleton rows={4} /></div>
                        ) : resolvedComplaints.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">No resolved complaints</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {resolvedComplaints.map((complaint) => (
                                    <div key={complaint.id} className="p-4 rounded-xl border border-border">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-medium text-foreground">{complaint.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {complaint.complaint_number} • {complaint.buildings?.name} • {complaint.location} • {format(new Date(complaint.created_at), "MMM d, yyyy")}
                                                </div>
                                                {complaint.resolved_at && (
                                                    <div className="text-sm text-success mt-1">
                                                        Resolved: {format(new Date(complaint.resolved_at), "MMM d, yyyy")}
                                                    </div>
                                                )}
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

export default PrincipalResolvedComplaints;