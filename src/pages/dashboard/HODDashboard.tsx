import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInHours } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { DashboardStatsSkeleton, TableRowsSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Users,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Loader2,
  Eye,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  X,
  XCircle,
  Calendar,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints, useComplaintStats } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import AssignStaffModal from "@/components/complaints/AssignStaffModal";
import ComplaintsPagination from "@/components/complaints/ComplaintsPagination";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
  buildings: { name: string } | null;
};

const priorityStyles: Record<string, { label: string; badge: string; border: string; glow: string }> = {
  critical: {
    label: "Critical Urgency",
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
    label: "Medium Priority",
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

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: "Pending Approval", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30" },
  acknowledged: { label: "Acknowledged", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-400/30" },
  approved: { label: "Approved / Dispatched", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-400/30" },
  in_progress: { label: "In Progress", color: "text-[#E0C88B]", bg: "bg-amber-500/15", border: "border-[#E0C88B]/40" },
  completed: { label: "Work Completed", color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-400/40" },
  rejected: { label: "Rejected", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-400/30" },
  on_hold: { label: "On Hold", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-400/30" },
  closed: { label: "Archived", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

const ITEMS_PER_PAGE = 8;

const HODDashboard = () => {
  const { user } = useAuth();
  const { departmentComplaints, loadingDeptComplaints, updateComplaintStatus, errorDeptComplaints } = useComplaints();
  const { data: stats, isLoading: loadingStats } = useComplaintStats();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [assignComplaint, setAssignComplaint] = useState<ComplaintWithJoins | null>(null);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"pending" | "in_progress" | "resolved" | "all">("pending");
  const [currentPage, setCurrentPage] = useState(1);

  // Enable real-time updates
  useRealtimeComplaints();

  const allDeptItems = (departmentComplaints as unknown as ComplaintWithJoins[]) || [];

  const pendingComplaints = useMemo(
    () => allDeptItems.filter((c) => c.status === "pending"),
    [allDeptItems]
  );
  const inProgressComplaints = useMemo(
    () => allDeptItems.filter((c) => ["approved", "in_progress", "acknowledged"].includes(c.status)),
    [allDeptItems]
  );
  const completedComplaints = useMemo(
    () => allDeptItems.filter((c) => ["completed", "closed"].includes(c.status)),
    [allDeptItems]
  );

  const criticalIssues = useMemo(
    () => pendingComplaints.filter((c) => c.priority === "critical" || c.priority === "high"),
    [pendingComplaints]
  );

  // Department Stats Calculations
  const totalComplaints = allDeptItems.length;
  const resolutionRate = totalComplaints > 0 ? Math.round((completedComplaints.length / totalComplaints) * 100) : 0;

  // Filtered complaints based on activeTab, search, and dropdowns
  const filteredComplaints = useMemo(() => {
    return allDeptItems.filter((c) => {
      // Tab filter
      if (activeTab === "pending" && c.status !== "pending") return false;
      if (activeTab === "in_progress" && !["approved", "in_progress", "acknowledged"].includes(c.status)) return false;
      if (activeTab === "resolved" && !["completed", "closed"].includes(c.status)) return false;

      // Dropdown status filter
      if (statusFilter !== "all" && c.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;

      // Search keyword
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        c.complaint_number.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.buildings?.name && c.buildings.name.toLowerCase().includes(q)) ||
        (c.departments?.name && c.departments.name.toLowerCase().includes(q)) ||
        (c.maintenance_categories?.name && c.maintenance_categories.name.toLowerCase().includes(q))
      );
    });
  }, [allDeptItems, activeTab, statusFilter, priorityFilter, search]);

  // Paginate
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleApprove = (complaint: ComplaintWithJoins) => {
    setAssignComplaint(complaint);
  };

  const handleReject = async (complaintId: string) => {
    try {
      await updateComplaintStatus.mutateAsync({
        complaintId,
        status: "rejected",
        note: "Rejected by Department Head (HOD)",
      });
      toast.success("Complaint rejected with notification sent.");
    } catch (error: unknown) {
      toast.error("Failed to reject complaint", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Stat cards with instant click-to-filter capability
  const statCards = [
    {
      id: "pending",
      label: "Pending Approval",
      value: pendingComplaints.length,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-400/30",
      tab: "pending" as const,
    },
    {
      id: "in_progress",
      label: "Active In-Progress",
      value: inProgressComplaints.length,
      icon: AlertTriangle,
      color: "text-sky-400",
      bg: "bg-sky-500/15",
      border: "border-sky-400/30",
      tab: "in_progress" as const,
    },
    {
      id: "completed",
      label: "Completed & Verified",
      value: completedComplaints.length,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-400/30",
      tab: "resolved" as const,
    },
    {
      id: "total",
      label: "Total Department Log",
      value: totalComplaints,
      icon: FileText,
      color: "text-[#E0C88B]",
      bg: "bg-[#E0C88B]/15",
      border: "border-[#E0C88B]/30",
      tab: "all" as const,
    },
  ];

  return (
    <div className="relative z-10 min-h-screen text-foreground">
      {/* Radiant ambient glow orbs behind content */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E0C88B]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-[140px]" />
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0C88B]/10 border border-[#E0C88B]/30 text-[#E0C88B] text-xs font-semibold uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E0C88B]" />
                  Department Head Operations Hub
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                  HOD <span className="text-gradient-gold italic font-serif">Command Center</span>
                </h1>
                <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                  Department triage desk for approving, dispatching, and overseeing campus maintenance tickets with real-time SLA supervision.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ReportDownloadButton
                  data={allDeptItems}
                  userRole="HOD"
                  userName={user?.email || "Department Head"}
                />
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#E0C88B] to-amber-500 text-black hover:opacity-95 font-semibold shadow-lg shadow-amber-500/20"
                >
                  <Link to="/maintenance">
                    <Sparkles className="w-4 h-4 mr-2 text-black" />
                    Browse Facilities
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Urgent Critical SLA Banner */}
          {criticalIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-950/30 to-[#0B1416]/60 border border-rose-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(244,63,94,0.18)]"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 animate-pulse text-rose-300">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                        Immediate Action Needed
                      </span>
                      <span className="text-slate-400 text-xs">
                        High Priority Queue
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mt-1">
                      {criticalIssues.length} Critical / High priority ticket{criticalIssues.length > 1 ? "s" : ""} pending your sign-off
                    </h3>
                    <p className="text-slate-300 text-xs md:text-sm mt-0.5">
                      Fast-track approvals to dispatch emergency technicians and prevent SLA breaches.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    onClick={() => {
                      setActiveTab("pending");
                      setPriorityFilter("critical");
                    }}
                    variant="outline"
                    className="border-rose-500/40 text-rose-200 hover:bg-rose-500/20 text-xs sm:text-sm flex-1 md:flex-none"
                  >
                    View Urgent Only
                  </Button>
                  <Button
                    onClick={() => handleApprove(criticalIssues[0])}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex-1 md:flex-none"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Fast-Assign Top Ticket
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Interactive Click-To-Filter Stat Cards */}
          {loadingStats ? (
            <DashboardStatsSkeleton count={4} />
          ) : (
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
                        {isActive ? "Active View" : "Filter"}
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
          )}

          {/* Main Workspace Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Interactive Triage Desk */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter Tabs & Search Dock */}
              <div className="p-4 md:p-5 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
                {/* Status Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/10 scrollbar-none">
                  {[
                    { id: "pending", label: "Pending Approvals", count: pendingComplaints.length, icon: Clock },
                    { id: "in_progress", label: "Active Repairs", count: inProgressComplaints.length, icon: AlertTriangle },
                    { id: "resolved", label: "Resolved Archive", count: completedComplaints.length, icon: CheckCircle2 },
                    { id: "all", label: "All Department Log", count: allDeptItems.length, icon: Layers },
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

                {/* Search Bar & Secondary Filters */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search ticket #, title, room, category..."
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

              {/* Complaints List Cards */}
              {loadingDeptComplaints ? (
                <div className="p-4 rounded-2xl glass-panel-dark border border-white/10">
                  <TableRowsSkeleton rows={5} />
                </div>
              ) : errorDeptComplaints ? (
                <div className="p-8 rounded-2xl glass-panel-dark border border-rose-500/30 text-center">
                  <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                  <p className="text-rose-300 font-semibold">Error loading department complaints</p>
                  <p className="text-slate-400 text-xs mt-1">{(errorDeptComplaints as Error).message}</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="p-12 rounded-2xl glass-panel-dark text-center border border-white/10">
                  <CheckCircle className="w-12 h-12 text-emerald-400/40 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white">No complaints match your selection</h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                    {search || priorityFilter !== "all"
                      ? "Try adjusting your search keywords or clearing active filters."
                      : "Great job! All department issues in this category are fully handled."}
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
                    {paginatedComplaints.map((complaint) => {
                      const pStyle = priorityStyles[complaint.priority] || priorityStyles.medium;
                      const sStyle = statusConfig[complaint.status] || statusConfig.pending;
                      const isPending = complaint.status === "pending";

                      return (
                        <motion.div
                          key={complaint.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-5 md:p-6 rounded-2xl glass-panel-dark border transition-all duration-300 hover:border-[#E0C88B]/40 group ${pStyle.border} ${pStyle.glow}`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              {/* Header Badges */}
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
                                <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {format(new Date(complaint.created_at), "MMM d, yyyy • h:mm a")}
                                </span>
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

                              {/* Metadata tags */}
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
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center md:flex-col gap-2 pt-2 md:pt-0 shrink-0">
                              {isPending ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(complaint)}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 flex-1 md:w-36"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                                    Approve & Assign
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedComplaint(complaint)}
                                    className="border-white/15 text-slate-200 hover:bg-white/10 text-xs flex-1 md:w-36"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                    Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleReject(complaint.id)}
                                    disabled={updateComplaintStatus.isPending}
                                    className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs flex-1 md:w-36"
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedComplaint(complaint)}
                                    className="border-white/15 text-slate-200 hover:bg-white/10 text-xs flex-1 md:w-36"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                    View Log
                                  </Button>
                                  {complaint.status !== "completed" && complaint.status !== "closed" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleApprove(complaint)}
                                      className="text-amber-300 hover:bg-amber-500/10 text-xs flex-1 md:w-36"
                                    >
                                      Reassign Staff
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pt-4">
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

            {/* Right Column: Department Health & Performance Radar */}
            <div className="space-y-6">
              {/* Department Resolution Radar Card */}
              <div className="p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0C88B]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#E0C88B]/15 border border-[#E0C88B]/30 flex items-center justify-center text-[#E0C88B]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Department Health</h2>
                    <p className="text-xs text-slate-400">Resolution performance</p>
                  </div>
                </div>

                {/* Circular / Bar Gauge */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Resolution Rate</span>
                    <span className="text-2xl font-black text-emerald-400">{resolutionRate}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#E0C88B] transition-all duration-1000"
                      style={{ width: `${resolutionRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                    <span>{completedComplaints.length} resolved</span>
                    <span>{totalComplaints} total logged</span>
                  </div>
                </div>

                {/* Status Breakdown Pills */}
                <div className="space-y-2.5">
                  {[
                    { label: "Pending Approvals", count: pendingComplaints.length, color: "bg-amber-400", tab: "pending" as const },
                    { label: "Active In-Progress", count: inProgressComplaints.length, color: "bg-sky-400", tab: "in_progress" as const },
                    { label: "Resolved & Closed", count: completedComplaints.length, color: "bg-emerald-400", tab: "resolved" as const },
                    { label: "Rejected / Withdrawn", count: allDeptItems.filter(c => c.status === "rejected").length, color: "bg-rose-400", tab: "all" as const },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveTab(item.tab);
                        setCurrentPage(1);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-xs text-slate-300 group-hover:text-white font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-[#E0C88B] transition-colors">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation / Protocols Card */}
              <div className="p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">HOD Protocols</h2>
                    <p className="text-xs text-slate-400">Dispatch guidelines</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="font-semibold text-white mb-0.5">⚡ Critical SLA (4 Hours)</p>
                    <p className="text-slate-400">Structural, power, or water hazards require immediate staff assignment.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="font-semibold text-white mb-0.5">⏱ Standard SLA (24 Hours)</p>
                    <p className="text-slate-400">Routine classroom or lab repairs should be assigned before day-end.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="font-semibold text-white mb-0.5">📊 Verified Approvals</p>
                    <p className="text-slate-400">Once technicians complete work, verify completion proof before sign-off.</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-[#E0C88B]/30 text-[#E0C88B] hover:bg-[#E0C88B]/10 text-xs"
                  >
                    <Link to="/maintenance">
                      <Building2 className="w-3.5 h-3.5 mr-2" />
                      View Campus Facility Grid
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Interactive Modals */}
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
