import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInHours } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { ComplaintCardListSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Eye,
  Loader2,
  MapPin,
  Calendar,
  TrendingUp,
  MessageSquare,
  Camera,
  Upload,
  Search,
  Filter,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
  Zap,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLES } from "@/config/constants";
import { toast } from "sonner";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import ComplaintsPagination from "@/components/complaints/ComplaintsPagination";
import ProgressUpdateModal from "@/components/complaints/ProgressUpdateModal";
import CompletionProofModal from "@/components/complaints/CompletionProofModal";
import useRealtimeComplaints from "@/hooks/useRealtimeComplaints";
import { sendComplaintEmail, ComplaintEmailData, EmailType } from "@/services/emailService";
import type { Database } from "@/integrations/supabase/types";

type ComplaintStatus = Database['public']['Enums']['complaint_status'];

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
  buildings: { name: string } | null;
  complaint_updates: Database['public']['Tables']['complaint_updates']['Row'][];
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  approved: { label: "Assigned • Ready", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30" },
  in_progress: { label: "Work In Progress", color: "text-[#E0C88B]", bg: "bg-amber-500/15", border: "border-[#E0C88B]/40" },
  on_hold: { label: "On Hold", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-400/30" },
  completed: { label: "Proof Uploaded", color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-400/40" },
  closed: { label: "Closed & Archived", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

const priorityStyles: Record<string, { label: string; badge: string; border: string; glow: string }> = {
  critical: {
    label: "Critical SLA",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/40",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
  },
  high: {
    label: "High Priority",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.12)]",
  },
  medium: {
    label: "Medium",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    border: "border-emerald-500/20",
    glow: "",
  },
  low: {
    label: "Routine",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    border: "border-sky-500/20",
    glow: "",
  },
};

const ITEMS_PER_PAGE = 8;

const MaintenanceStaffDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [progressComplaint, setProgressComplaint] = useState<ComplaintWithJoins | null>(null);
  const [completionComplaint, setCompletionComplaint] = useState<ComplaintWithJoins | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"assigned" | "in_progress" | "on_hold" | "completed" | "all">("assigned");
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

  // Stats
  const stats = useMemo(() => {
    if (!assignedComplaints) return { assigned: 0, in_progress: 0, completed: 0, on_hold: 0, overdue: 0, total: 0 };
    const now = new Date();
    return {
      assigned: assignedComplaints.filter((c: ComplaintWithJoins) => c.status === "approved").length,
      in_progress: assignedComplaints.filter((c: ComplaintWithJoins) => c.status === "in_progress").length,
      completed: assignedComplaints.filter((c: ComplaintWithJoins) => c.status === "completed").length,
      on_hold: assignedComplaints.filter((c: ComplaintWithJoins) => c.status === "on_hold").length,
      overdue: assignedComplaints.filter((c: ComplaintWithJoins) =>
        c.expected_resolution && new Date(c.expected_resolution) < now && c.status !== "completed"
      ).length,
      total: assignedComplaints.length,
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
      if (complaint && status !== "completed") {
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
          if (note?.toLowerCase().includes("resume")) emailType = "work_resumed";
          else emailType = "work_started";
        } else if (status === "on_hold") {
          emailType = "work_on_hold";
        }

        sendComplaintEmail(emailType, emailData, { note }).catch(console.error);
      }
    },
    onSuccess: () => {
      toast.success("Task status updated");
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

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    if (!assignedComplaints) return [];
    return assignedComplaints.filter((c: ComplaintWithJoins) => {
      // Tab filter
      if (activeTab === "assigned" && c.status !== "approved") return false;
      if (activeTab === "in_progress" && c.status !== "in_progress") return false;
      if (activeTab === "on_hold" && c.status !== "on_hold") return false;
      if (activeTab === "completed" && c.status !== "completed") return false;

      // Status filter dropdown
      if (statusFilter !== "all" && c.status !== statusFilter) return false;

      // Priority filter dropdown
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;

      // Search keyword
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        c.complaint_number.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.buildings?.name && c.buildings.name.toLowerCase().includes(q)) ||
        (c.maintenance_categories?.name && c.maintenance_categories.name.toLowerCase().includes(q))
      );
    });
  }, [assignedComplaints, activeTab, statusFilter, priorityFilter, search]);

  // Paginate
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Click-to-filter stat cards
  const statCards = [
    {
      id: "assigned",
      label: "New Assigned",
      value: stats.assigned,
      icon: Wrench,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-400/30",
      tab: "assigned" as const,
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: stats.in_progress,
      icon: Play,
      color: "text-[#E0C88B]",
      bg: "bg-amber-500/20",
      border: "border-[#E0C88B]/40",
      tab: "in_progress" as const,
    },
    {
      id: "on_hold",
      label: "On Hold",
      value: stats.on_hold,
      icon: Pause,
      color: "text-rose-400",
      bg: "bg-rose-500/15",
      border: "border-rose-400/30",
      tab: "on_hold" as const,
    },
    {
      id: "completed",
      label: "Work Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-400/30",
      tab: "completed" as const,
    },
  ];

  return (
    <div className="relative z-10 min-h-screen text-foreground">
      {/* Radiant ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E0C88B]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E0C88B]/15">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Tactical Dispatch Studio • On-Duty Field Technician
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                  Field Staff <span className="text-gradient-gold italic font-serif">Command Center</span>
                </h1>
                <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                  Manage active dispatches, start work timers, document progress milestones, and submit photo verification proofs.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ReportDownloadButton
                  data={assignedComplaints || []}
                  userRole="Maintenance Staff"
                  userName={user?.email || "Staff Technician"}
                />
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#E0C88B] to-amber-500 text-black hover:opacity-95 font-semibold shadow-lg shadow-amber-500/20"
                >
                  <Link to="/maintenance">
                    <Sparkles className="w-4 h-4 mr-2 text-black" />
                    Campus Facility Directory
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Overdue Tasks Alert Strip */}
          {stats.overdue > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-950/30 to-[#0B1416]/60 border border-rose-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(244,63,94,0.18)]"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 animate-pulse text-rose-300">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                        SLA Overdue Warning
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mt-1">
                      {stats.overdue} task{stats.overdue > 1 ? "s are" : " is"} past the promised resolution deadline
                    </h3>
                    <p className="text-slate-300 text-xs md:text-sm mt-0.5">
                      Prioritize these items to prevent campus escalation tickets to the Principal.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setActiveTab("all");
                    setPriorityFilter("critical");
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/30"
                >
                  Filter Overdue Tasks
                </Button>
              </div>
            </motion.div>
          )}

          {/* Click-To-Filter Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            {statCards.map((stat, i) => {
              const isActive = activeTab === stat.tab;
              return (
                <motion.button
                  key={stat.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  onClick={() => {
                    setActiveTab(stat.tab);
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`relative text-left p-5 md:p-6 rounded-2xl glass-panel-dark border transition-all duration-300 overflow-hidden group hover:scale-[1.02] cursor-pointer ${
                    isActive
                      ? "border-[#E0C88B] ring-2 ring-[#E0C88B]/30 shadow-[0_0_30px_rgba(224,200,139,0.18)]"
                      : "border-white/10 hover:border-[#E0C88B]/40"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} border ${stat.border}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isActive ? 'bg-[#E0C88B] text-black' : 'bg-white/5 text-slate-400'}`}>
                      {isActive ? "Active Queue" : "View"}
                    </span>
                  </div>

                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1 tracking-tight drop-shadow-md">
                    {stat.value}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">
                    {stat.label}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Filter Tabs & Search Dock */}
          <div className="p-4 md:p-5 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/10 scrollbar-none">
              {[
                { id: "assigned", label: "Ready to Start", count: stats.assigned, icon: Wrench },
                { id: "in_progress", label: "In Progress", count: stats.in_progress, icon: Play },
                { id: "on_hold", label: "On Hold", count: stats.on_hold, icon: Pause },
                { id: "completed", label: "Completed Proofs", count: stats.completed, icon: CheckCircle2 },
                { id: "all", label: "All My Tasks", count: stats.total, icon: Layers },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                      isSelected
                        ? "bg-gradient-to-r from-[#E0C88B] to-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${isSelected ? "text-black" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? "bg-black/20 text-black font-extrabold" : "bg-white/10 text-slate-300"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by ticket #, room, description, category..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-9 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:border-[#E0C88B] focus:ring-[#E0C88B]/30 h-10"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-slate-200 px-3 text-xs focus:border-[#E0C88B] focus:outline-none focus:ring-1 focus:ring-[#E0C88B]"
                >
                  <option value="all" className="bg-[#0B1416] text-white">All Priorities</option>
                  <option value="critical" className="bg-[#0B1416] text-rose-300">Critical Priority</option>
                  <option value="high" className="bg-[#0B1416] text-amber-300">High Priority</option>
                  <option value="medium" className="bg-[#0B1416] text-emerald-300">Medium Priority</option>
                  <option value="low" className="bg-[#0B1416] text-sky-300">Routine (Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task Cards List */}
          {isLoading ? (
            <div className="py-4">
              <ComplaintCardListSkeleton count={4} />
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-16 rounded-2xl glass-panel-dark text-center border border-white/10">
              <CheckCircle className="w-14 h-14 text-emerald-400/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">No tasks in this view</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                {search || priorityFilter !== "all"
                  ? "No tasks match your search filters. Try clearing them."
                  : "All caught up! Stand by for new work orders from the HOD triage desk."}
              </p>
              {(search || priorityFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setPriorityFilter("all");
                    setStatusFilter("all");
                  }}
                  className="mt-4 border-white/20 text-slate-300 hover:text-white"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {paginatedComplaints.map((complaint: ComplaintWithJoins) => {
                  const pStyle = priorityStyles[complaint.priority] || priorityStyles.medium;
                  const sStyle = statusConfig[complaint.status] || statusConfig.approved;
                  const timeInfo = complaint.expected_resolution
                    ? getTimeRemaining(complaint.expected_resolution)
                    : null;

                  return (
                    <motion.div
                      key={complaint.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-5 md:p-6 rounded-2xl glass-panel-dark border transition-all duration-300 hover:border-[#E0C88B]/40 group ${
                        timeInfo?.isOverdue
                          ? "border-rose-500/50 bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.15)]"
                          : `${pStyle.border} ${pStyle.glow}`
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="space-y-2 flex-1">
                          {/* Badges Bar */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#E0C88B] bg-[#E0C88B]/10 px-2.5 py-0.5 rounded-full border border-[#E0C88B]/20">
                              {complaint.complaint_number}
                            </span>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${pStyle.badge}`}>
                              {pStyle.label}
                            </span>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${sStyle.bg} ${sStyle.color} ${sStyle.border}`}>
                              {sStyle.label}
                            </span>
                            {timeInfo && (
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                  timeInfo.isOverdue
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                {timeInfo.text}
                              </span>
                            )}
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-[#E0C88B] transition-colors">
                              {complaint.title}
                            </h3>
                            <p className="text-slate-300 text-xs md:text-sm line-clamp-2 mt-1">
                              {complaint.description}
                            </p>
                          </div>

                          {/* Location & Metadata */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                            {complaint.buildings?.name && (
                              <span className="flex items-center gap-1 text-slate-300">
                                <Building2 className="w-3.5 h-3.5 text-[#E0C88B]" />
                                {complaint.buildings.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              {complaint.location}
                            </span>
                            {complaint.maintenance_categories?.name && (
                              <span className="flex items-center gap-1 text-slate-300">
                                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                                {complaint.maintenance_categories.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              Assigned {format(new Date(complaint.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Action Station */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowDetails(true);
                            }}
                            className="border-white/15 text-slate-200 hover:bg-white/10 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Inspect
                          </Button>

                          {complaint.status === "approved" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatus.mutate({
                                  complaintId: complaint.id,
                                  status: "in_progress",
                                  note: "Technician arrived on-site and initiated repair.",
                                })
                              }
                              disabled={updateStatus.isPending}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20"
                            >
                              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                              Start Work Timer
                            </Button>
                          )}

                          {complaint.status === "in_progress" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setProgressComplaint(complaint)}
                                className="border-[#E0C88B]/40 text-[#E0C88B] hover:bg-[#E0C88B]/10 text-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                Add Note
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatus.mutate({
                                    complaintId: complaint.id,
                                    status: "on_hold",
                                    note: "Task temporarily placed on hold awaiting parts/access.",
                                  })
                                }
                                disabled={updateStatus.isPending}
                                className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs"
                              >
                                <Pause className="w-3.5 h-3.5 mr-1.5" />
                                Hold
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setCompletionComplaint(complaint)}
                                className="bg-gradient-to-r from-[#E0C88B] to-amber-500 text-black hover:opacity-95 font-bold text-xs shadow-md shadow-amber-500/20"
                              >
                                <Camera className="w-3.5 h-3.5 mr-1.5 text-black" />
                                Complete & Upload Proof
                              </Button>
                            </>
                          )}

                          {complaint.status === "on_hold" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatus.mutate({
                                  complaintId: complaint.id,
                                  status: "in_progress",
                                  note: "Resumed active maintenance after delay.",
                                })
                              }
                              disabled={updateStatus.isPending}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20"
                            >
                              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                              Resume Work
                            </Button>
                          )}

                          {complaint.status === "completed" && (
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Awaiting Faculty Verification
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-6">
                  <ComplaintsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
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
