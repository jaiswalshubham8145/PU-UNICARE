import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, CheckCircle, Loader2, Eye, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { useBulkActions } from "@/hooks/useBulkActions";
import { format } from "date-fns";
import { useState } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import AssignStaffModal from "@/components/complaints/AssignStaffModal";
import BulkActionToolbar from "@/components/complaints/BulkActionToolbar";
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

const AdminAllComplaints = () => {
    const { user } = useAuth();
    const { allComplaints, loadingAllComplaints } = useComplaints();
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    // Bulk Actions Hook
    const {
        selectedIds,
        toggleSelection,
        selectAll,
        clearSelection,
        updateStatus,
        assignTo,
        deleteComplaints,
        isLoading: isBulkProcessing
    } = useBulkActions();

    // Enable real-time updates
    useRealtimeComplaints();

    const complaints = (allComplaints as unknown as ComplaintWithJoins[]) || [];

    const handleAssignStaff = (staffId: string) => {
        assignTo({ staffId });
        setAssignModalOpen(false);
    };

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
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">All Complaints</h1>
                            <p className="text-muted-foreground">Complete list of all complaints in the system</p>
                        </div>
                    </div>

                    <div className="card-elevated p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                All Complaints ({complaints.length})
                            </h2>
                            {complaints.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        selectedIds.length === complaints.length
                                            ? clearSelection()
                                            : selectAll(complaints.map(c => c.id))
                                    }
                                >
                                    {selectedIds.length === complaints.length ? "Deselect All" : "Select All"}
                                </Button>
                            )}
                        </div>

                        {loadingAllComplaints ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                            </div>
                        ) : complaints.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">No complaints found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {complaints.map((complaint) => (
                                    <div key={complaint.id} className={`p-4 rounded-xl border transition-all ${selectedIds.includes(complaint.id) ? 'border-accent bg-accent/5' : 'border-border'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="pt-1">
                                                <Checkbox
                                                    checked={selectedIds.includes(complaint.id)}
                                                    onCheckedChange={() => toggleSelection(complaint.id)}
                                                />
                                            </div>
                                            <div className="flex-1">
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
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${complaint.status === 'pending' ? 'bg-warning text-warning-foreground' :
                                                            complaint.status === 'in_progress' ? 'bg-info text-info-foreground' :
                                                                complaint.status === 'completed' ? 'bg-success text-success-foreground' :
                                                                    complaint.status === 'rejected' ? 'bg-destructive text-destructive-foreground' :
                                                                        'bg-secondary text-secondary-foreground'
                                                            }`}>
                                                            {complaint.status.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedComplaint(complaint);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />

            <BulkActionToolbar
                selectedCount={selectedIds.length}
                onClearSelection={clearSelection}
                onAssignTo={() => setAssignModalOpen(true)}
                onChangeStatus={(status) => updateStatus({ status })}
                onDelete={() => deleteComplaints()}
                isProcessing={isBulkProcessing}
            />

            {/* Modals */}
            <ComplaintDetailsModal
                complaint={selectedComplaint}
                open={!!selectedComplaint}
                onClose={() => setSelectedComplaint(null)}
            />

            <AssignStaffModal
                open={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onAssign={handleAssignStaff}
                complaintId="bulk"
            />
        </div>
    );
};

export default AdminAllComplaints;