import Navbar from "@/components/layout/Navbar";

import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, AlertTriangle, UserCheck, Users, TrendingUp, AlertCircle, BarChart3, Loader2, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints, useComplaintStats } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import AssignStaffModal from "@/components/complaints/AssignStaffModal";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
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

const HODDashboard = () => {
  const { user } = useAuth();
  const { departmentComplaints, loadingDeptComplaints, updateComplaintStatus, errorDeptComplaints } = useComplaints();
  const { data: stats, isLoading: loadingStats } = useComplaintStats();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [assignComplaint, setAssignComplaint] = useState<ComplaintWithJoins | null>(null);

  // Enable real-time updates
  useRealtimeComplaints();

  const pendingComplaints = (departmentComplaints as unknown as ComplaintWithJoins[])?.filter((c) => c.status === "pending") || [];
  const approvedComplaints = (departmentComplaints as unknown as ComplaintWithJoins[])?.filter((c) => c.status === "approved") || [];
  const criticalCount = pendingComplaints.filter((c) => c.priority === "critical" || c.priority === "high").length;

  const handleApprove = async (complaint: ComplaintWithJoins) => {
    // Open assign staff modal for approval with assignment
    setAssignComplaint(complaint);
  };

  const handleReject = async (complaintId: string) => {
    try {
      await updateComplaintStatus.mutateAsync({
        complaintId,
        status: "rejected",
        note: "Rejected by HOD",
      });
      toast.success("Complaint rejected");
    } catch (error: unknown) {
      toast.error("Failed to reject complaint", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  };

  const statCards = [
    { label: "Pending Approval", value: stats?.pending || 0, icon: Clock, color: "bg-warning", path: "/dashboard/hod/pending" },
    { label: "In Progress", value: stats?.in_progress || 0, icon: AlertTriangle, color: "bg-info", path: "/dashboard/hod/in-progress" },
    { label: "Completed", value: stats?.completed || 0, icon: CheckCircle, color: "bg-success", path: "/dashboard/hod/completed" },
    { label: "Total", value: stats?.total || 0, icon: FileText, color: "bg-primary", path: "/dashboard/hod/all" },
  ];

  return (
    <div className="relative z-10 min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              <span className="text-gradient-gold">HOD</span> Dashboard
            </h1>
            <p className="text-amber-200 uppercase tracking-widest text-sm font-medium mb-6">Department Overview • {user?.email?.split("@")[0]}</p>
            <div className="flex justify-center">
              <ReportDownloadButton data={(departmentComplaints as unknown as ComplaintWithJoins[]) || []} userRole="HOD" userName={user?.email || ""} />
            </div>
          </div>

          {criticalCount > 0 && (
            <div className="glass-panel-dark border-red-500/30 p-6 rounded-2xl mb-12 flex items-center gap-6 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/50">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">{criticalCount} critical issues pending</p>
                <p className="text-slate-400">Immediate approval required</p>
              </div>
              <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700 text-white border-none shadow-lg">
                Review Now
              </Button>
            </div>
          )}

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {statCards.map((stat, i) => (
                <Link key={i} to={stat.path} className="block h-full group">
                  <div className="glass-panel p-6 rounded-2xl h-full card-hover-effect flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${stat.color === 'bg-warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      stat.color === 'bg-info' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        stat.color === 'bg-success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-white/10 text-white border border-white/20'
                      }`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-1 drop-shadow-md">{stat.value}</div>
                    <div className="text-xs uppercase tracking-widest text-slate-300 font-medium">{stat.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-elevated p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Pending Approvals
              </h2>
              {loadingDeptComplaints ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : errorDeptComplaints ? (
                <div className="text-center py-8 text-destructive">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Error loading complaints: {(errorDeptComplaints as Error).message}</p>
                </div>
              ) : pendingComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-success/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(pendingComplaints as ComplaintWithJoins[]).slice(0, 5).map((complaint) => (
                    <div key={complaint.id} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-foreground">{complaint.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {complaint.complaint_number} • {complaint.buildings?.name} • {complaint.location} • {format(new Date(complaint.created_at), "MMM d")}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                          {complaint.priority}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(complaint)}
                          disabled={updateComplaintStatus.isPending}
                        >
                          Approve & Assign
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

            <div className="space-y-6">
              <div className="card-elevated p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Department Stats
                </h2>
                <div className="space-y-4">
                  <Link to="/dashboard/hod/all" className="block">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <span className="text-gray-500">Total Complaints</span>
                      <span className="font-semibold text-gray-900">{stats?.total || 0}</span>
                    </div>
                  </Link>
                  <Link to="/dashboard/hod/completed" className="block">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <span className="text-gray-500">Completed</span>
                      <span className="font-semibold text-gray-900">{stats?.completed || 0}</span>
                    </div>
                  </Link>
                  <Link to="/dashboard/hod/completed" className="block">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <span className="text-gray-500">Resolution Rate</span>
                      <span className="font-semibold text-emerald-600">
                        {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="card-elevated p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Status Overview
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Pending", value: stats?.pending || 0, color: "bg-amber-500", path: "/dashboard/hod/pending" },
                    { label: "Approved", value: stats?.approved || 0, color: "bg-emerald-500", path: "/dashboard/hod/in-progress" },
                    { label: "In Progress", value: stats?.in_progress || 0, color: "bg-blue-500", path: "/dashboard/hod/in-progress" },
                    { label: "Rejected", value: stats?.rejected || 0, color: "bg-red-500", path: "/dashboard/hod/all" },
                  ].map((item, i) => (
                    <Link key={i} to={item.path} className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-gray-500">{item.label}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
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
      <AssignStaffModal
        complaint={assignComplaint}
        open={!!assignComplaint}
        onClose={() => setAssignComplaint(null)}
      />
    </div>
  );
};

export default HODDashboard;
