import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench, Clock, CheckCircle, AlertTriangle, Play, Pause, Eye,
  Loader2, MapPin, Calendar, TrendingUp, MessageSquare, Camera, Upload
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLES } from "@/config/constants";
import { format, differenceInHours } from "date-fns";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import ComplaintFilters from "@/components/complaints/ComplaintFilters";
import ComplaintsPagination from "@/components/complaints/ComplaintsPagination";
import ProgressUpdateModal from "@/components/complaints/ProgressUpdateModal";
import CompletionProofModal from "@/components/complaints/CompletionProofModal";
import useRealtimeComplaints from "@/hooks/useRealtimeComplaints";
import { Database } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import { sendComplaintEmail, ComplaintEmailData, EmailType } from "@/services/emailService";

type ComplaintStatus = Database['public']['Enums']['complaint_status'];

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
  complaint_updates: Database['public']['Tables']['complaint_updates']['Row'][];
};

const statusColors: Record<string, string> = {
  approved: "bg-success/10 text-success",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  on_hold: "bg-warning/10 text-warning",
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-orange-500/10 text-orange-500",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
};

const ITEMS_PER_PAGE = 10;

const MaintenanceStaffDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [progressComplaint, setProgressComplaint] = useState<ComplaintWithJoins | null>(null);
  const [completionComplaint, setCompletionComplaint] = useState<ComplaintWithJoins | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

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
          buildings(name),
          complaint_updates(*)
        `)
        .eq("assigned_to", user.id)
        .in("status", ["approved", "in_progress", "on_hold", "completed"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    if (!assignedComplaints) return [];
    return assignedComplaints.filter((c: ComplaintWithJoins) => {
      const matchesSearch = !search ||
        c.complaint_number.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [assignedComplaints, search, statusFilter, priorityFilter]);

  // Paginate
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const stats = useMemo(() => {
    if (!assignedComplaints) return { assigned: 0, in_progress: 0, completed: 0, on_hold: 0, overdue: 0 };
    const now = new Date();
    return {
      assigned: assignedComplaints.filter((c: ComplaintWithJoins) => c.status === "approved").length,
      in_progress: assignedComplaints.filter((c: ComplaintWithJoins) => c.status === "in_progress").length,
      completed: assignedComplaints.filter((c: ComplaintWithJoins) => c.status === "completed").length,
      on_hold: assignedComplaints.filter((c: ComplaintWithJoins) => c.status === "on_hold").length,
      overdue: assignedComplaints.filter((c: ComplaintWithJoins) =>
        c.expected_resolution && new Date(c.expected_resolution) < now && c.status !== "completed"
      ).length,
    };
  }, [assignedComplaints]);

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ complaintId, status, note }: { complaintId: string; status: ComplaintStatus; note?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const updateData: Partial<Database['public']['Tables']['complaints']['Update']> = { status };
      if (status === "completed") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from(TABLES.COMPLAINTS)
        .update(updateData)
        .eq("id", complaintId);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from(TABLES.COMPLAINT_UPDATES)
        .insert({
          complaint_id: complaintId,
          status,
          updated_by: user.id,
          note: note || `Status changed to ${status.replace("_", " ")}`,
        });

      if (insertError) throw insertError;

      // Send email notification based on status change
      const complaint = assignedComplaints?.find((c: ComplaintWithJoins) => c.id === complaintId);
      if (complaint && status !== "completed") { // Completed is handled in CompletionProofModal
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

        let emailType: EmailType = "status_update";
        if (status === "in_progress") {
          // Check if it was on hold to decide if it's "resumed" or "started"
          if (note?.toLowerCase().includes("resume")) emailType = "work_resumed";
          else emailType = "work_started";
        } else if (status === "on_hold") {
          emailType = "work_on_hold";
        }

        sendComplaintEmail(emailType, emailData, { note }).catch(console.error);
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

  const getTimeRemaining = (expectedDate: string) => {
    const hours = differenceInHours(new Date(expectedDate), new Date());
    if (hours < 0) return { text: `${Math.abs(hours)}h overdue`, isOverdue: true };
    if (hours < 24) return { text: `${hours}h remaining`, isOverdue: false };
    return { text: `${Math.ceil(hours / 24)}d remaining`, isOverdue: false };
  };

  const statCards = [
    { label: "New Assigned", value: stats.assigned, icon: Wrench, color: "bg-primary", path: "/dashboard/maintenance/new-assigned" },
    { label: "In Progress", value: stats.in_progress, icon: Play, color: "bg-info", path: "/dashboard/maintenance/in-progress" },
    { label: "On Hold", value: stats.on_hold, icon: Pause, color: "bg-warning", path: "/dashboard/maintenance/on-hold" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "bg-success", path: "/dashboard/maintenance/completed" },
  ];

  return (
    <div className="relative z-10 min-h-screen transparency-medium noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Maintenance Dashboard</h1>
              <p className="text-muted-foreground">Manage your assigned maintenance tasks</p>
            </div>
            <ReportDownloadButton data={assignedComplaints || []} userRole="Maintenance Staff" userName={user?.email || ""} />
          </div>

          {/* Overdue Alert */}
          {stats.overdue > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <p className="text-foreground">
                <span className="font-semibold">{stats.overdue} task(s)</span> are overdue. Please complete them as soon as possible.
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <Link key={i} to={stat.path} className="block">
                <div className="card-elevated p-6 cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Complaints List */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Assigned Tasks</h2>
            </div>

            <div className="p-6">
              <ComplaintFilters
                search={search}
                onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
                statusFilter={statusFilter}
                onStatusChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                priorityFilter={priorityFilter}
                onPriorityChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}
                onClear={() => { setSearch(""); setStatusFilter("all"); setPriorityFilter("all"); setCurrentPage(1); }}
              />

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : paginatedComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {paginatedComplaints.map((complaint: ComplaintWithJoins, index: number) => {
                      const timeInfo = complaint.expected_resolution
                        ? getTimeRemaining(complaint.expected_resolution)
                        : null;

                      return (
                        <motion.div
                          key={complaint.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`complaint-item p-4 rounded-lg border transition-all duration-300 hover-luxury ${timeInfo?.isOverdue
                            ? "border-destructive/50 bg-destructive/5"
                            : "border-border hover:border-accent/50"
                            }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="text-sm font-medium text-accent">{complaint.complaint_number}</span>
                                <Badge className={priorityColors[complaint.priority]}>{complaint.priority}</Badge>
                                <Badge className={statusColors[complaint.status] || "bg-secondary"}>
                                  {complaint.status.replace("_", " ")}
                                </Badge>
                                {timeInfo?.isOverdue && (
                                  <Badge className="bg-destructive text-destructive-foreground">OVERDUE</Badge>
                                )}
                              </div>
                              <h3 className="font-medium text-foreground">{complaint.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {complaint.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(complaint.created_at), "MMM d, yyyy")}
                                </span>
                                {timeInfo && (
                                  <span className={`flex items-center gap-1 ${timeInfo.isOverdue ? "text-destructive" : "text-warning"}`}>
                                    <Clock className="w-3 h-3" />
                                    {timeInfo.text}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedComplaint(complaint); setShowDetails(true); }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>

                              {complaint.status === "approved" && (
                                <Button
                                  size="sm"
                                  variant="accent"
                                  onClick={() => updateStatus.mutate({ complaintId: complaint.id, status: "in_progress", note: "Started working on this task" })}
                                  disabled={updateStatus.isPending}
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Start Work
                                </Button>
                              )}

                              {complaint.status === "in_progress" && (
                                <>
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
                                </>
                              )}

                              {complaint.status === "on_hold" && (
                                <Button
                                  size="sm"
                                  variant="accent"
                                  onClick={() => updateStatus.mutate({ complaintId: complaint.id, status: "in_progress", note: "Resumed working on this task" })}
                                  disabled={updateStatus.isPending}
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Resume
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <ComplaintsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredComplaints.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </div>
      </main>
      <Footer />

      {/* Modals */}
      <ComplaintDetailsModal
        complaint={selectedComplaint}
        open={showDetails}
        onClose={() => setShowDetails(false)}
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

export default MaintenanceStaffDashboard;
