import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { TableRowsSkeleton, ComplaintCardListSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  TrendingUp,
  Calendar,
  Bell,
  Loader2,
  Eye,
  Star,
  ThumbsUp,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Activity,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints, useComplaintStats } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import VerifyCompletionModal from "@/components/complaints/VerifyCompletionModal";
import ComplaintsPagination from "@/components/complaints/ComplaintsPagination";
import type { Database } from "@/integrations/supabase/types";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
  complaint_updates?: Database['public']['Tables']['complaint_updates']['Row'][];
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: "Pending Review", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30" },
  acknowledged: { label: "Acknowledged", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-400/30" },
  approved: { label: "Approved by HOD", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-400/30" },
  in_progress: { label: "In Progress", color: "text-[#E0C88B]", bg: "bg-amber-500/15", border: "border-[#E0C88B]/40" },
  completed: { label: "Work Completed", color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-400/40" },
  rejected: { label: "Rejected", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-400/30" },
  on_hold: { label: "On Hold", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-400/30" },
  closed: { label: "Closed & Archived", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

const priorityBadges: Record<string, { label: string; color: string; border: string }> = {
  critical: { label: "Critical SLA", color: "text-rose-400 bg-rose-500/15", border: "border-rose-500/40" },
  high: { label: "High Priority", color: "text-amber-400 bg-amber-500/15", border: "border-amber-500/40" },
  medium: { label: "Medium", color: "text-emerald-400 bg-emerald-500/15", border: "border-emerald-500/40" },
  low: { label: "Routine", color: "text-sky-400 bg-sky-500/15", border: "border-sky-500/40" },
};

const ITEMS_PER_PAGE = 8;

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { myComplaints, loadingMyComplaints } = useComplaints();
  const { data: stats, isLoading: loadingStats } = useComplaintStats();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [verifyComplaint, setVerifyComplaint] = useState<ComplaintWithJoins | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "verify" | "resolved">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Enable real-time updates
  useRealtimeComplaints();

  // Complaints awaiting verification (completed status)
  const awaitingVerification = useMemo(() => {
    if (!myComplaints) return [];
    return myComplaints.filter((c: ComplaintWithJoins) => c.status === "completed");
  }, [myComplaints]);

  // Dynamic filter based on interactive tabs and search
  const filteredComplaints = useMemo(() => {
    if (!myComplaints) return [];
    return myComplaints.filter((c: ComplaintWithJoins) => {
      // Tab filter
      if (activeTab === "active" && !["pending", "acknowledged", "approved", "in_progress"].includes(c.status)) {
        return false;
      }
      if (activeTab === "verify" && c.status !== "completed") {
        return false;
      }
      if (activeTab === "resolved" && !["completed", "closed"].includes(c.status)) {
        return false;
      }

      // Dropdown status filter
      if (statusFilter !== "all" && c.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && c.priority !== priorityFilter) {
        return false;
      }

      // Search keyword
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        c.complaint_number.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.departments?.name && c.departments.name.toLowerCase().includes(q))
      );
    });
  }, [myComplaints, search, statusFilter, priorityFilter, activeTab]);

  // Paginate
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Interactive Click-To-Filter Stat Cards
  const statCards = [
    {
      id: "all",
      label: "Total Filed",
      value: myComplaints?.length || 0,
      icon: FileText,
      color: "text-[#E0C88B]",
      bg: "bg-[#E0C88B]/15",
      border: "border-[#E0C88B]/30",
      targetStatus: "all",
    },
    {
      id: "pending",
      label: "Pending Review",
      value: myComplaints?.filter(c => c.status === "pending").length || 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-400/30",
      targetStatus: "pending",
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: myComplaints?.filter(c => c.status === "in_progress" || c.status === "approved").length || 0,
      icon: AlertTriangle,
      color: "text-sky-400",
      bg: "bg-sky-500/15",
      border: "border-sky-400/30",
      targetStatus: "in_progress",
    },
    {
      id: "completed",
      label: "Work Finished",
      value: myComplaints?.filter(c => c.status === "completed" || c.status === "closed").length || 0,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-400/30",
      targetStatus: "completed",
    },
  ];

  const handleStatCardClick = (targetStatus: string) => {
    setStatusFilter(targetStatus);
    setActiveTab("all");
    setCurrentPage(1);
  };

  return (
    <div className="relative z-10 min-h-screen text-foreground selection:bg-[#E0C88B]/30 selection:text-[#F7F2E7] overflow-x-hidden">
      <Navbar />

      {/* Radiant Ambient Backdrop (Allows BackgroundVideo to show through) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B0D]/40 via-transparent to-[#0B1416]/50" />
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-[#E0C88B]/12 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 -right-20 w-[550px] h-[550px] bg-emerald-500/12 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[130px]" />
      </div>

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

          {/* Top Header & Fast Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full mb-3 border-[#E0C88B]/40 bg-[#E0C88B]/10">
                <ShieldCheck className="w-4 h-4 text-[#E0C88B]" />
                <span className="text-[#F7F2E7] font-mono text-xs uppercase tracking-widest font-bold">
                  Faculty Workspace
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Faculty <span className="text-gradient-gold font-extrabold">Command Studio</span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base font-sans mt-1">
                Manage your campus facility requests, track live technicians, and verify completed repairs.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <ReportDownloadButton data={myComplaints || []} userRole="Faculty" userName={user?.email || ""} />
              <Button
                asChild
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] font-black font-sans shadow-[0_0_25px_rgba(224,200,139,0.35)] transition-all hover:scale-105"
              >
                <Link to="/register-complaint">
                  <Plus className="w-5 h-5 mr-1.5" />
                  File New Complaint
                </Link>
              </Button>
            </div>
          </div>

          {/* Awaiting Verification Interactive Banner (If Any Completed Tickets) */}
          {awaitingVerification.length > 0 && (
            <div className="glass-panel-dark rounded-3xl p-6 mb-8 border border-emerald-400/50 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(52,211,153,0.2)] relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/40 shadow-inner shrink-0">
                    <Star className="w-6 h-6 text-[#E0C88B] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                      <span>Action Required: Technician Completed Work</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E0C88B]/20 text-[#E0C88B] border border-[#E0C88B]/30">
                        {awaitingVerification.length} Ready for Sign-Off
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 font-sans mt-0.5">
                      The maintenance staff has submitted completion photos. Please verify the work quality and rate your satisfaction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {awaitingVerification.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-4 hover:border-emerald-400/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#E0C88B]">{c.complaint_number}</span>
                        <span className="text-[11px] text-slate-400">• {c.location}</span>
                      </div>
                      <p className="font-bold text-sm text-white truncate">{c.title}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setVerifyComplaint(c)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2 h-auto rounded-xl shadow-lg shrink-0 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Rate</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Click-to-Filter Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map((stat) => {
              const isActive = statusFilter === stat.targetStatus;

              return (
                <div
                  key={stat.id}
                  onClick={() => handleStatCardClick(stat.targetStatus)}
                  className={`glass-panel-dark p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                    isActive
                      ? "border-[#E0C88B] shadow-[0_0_30px_rgba(224,200,139,0.3)] bg-white/[0.06] scale-[1.02]"
                      : "border-white/10 hover:border-white/25 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.border} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#E0C88B] text-[#060F10]">
                        Active Filter
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                        Click to filter
                      </span>
                    )}
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight group-hover:text-gradient-gold transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Workspace (Table & Live Matrix) */}
          <div className="glass-panel-dark rounded-3xl p-6 lg:p-8 border border-white/10 dark:border-[#E0C88B]/25 shadow-2xl relative overflow-hidden">
            
            {/* Controls Bar: Tabs & Live Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              {/* Interactive Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: "All Tickets" },
                  { id: "active", label: "In Progress / Active" },
                  { id: "verify", label: `Awaiting Verification (${awaitingVerification.length})` },
                  { id: "resolved", label: "Resolved History" },
                ].map((t) => {
                  const isTabActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id as any);
                        setStatusFilter("all");
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isTabActive
                          ? "bg-[#E0C88B] text-[#060F10] font-bold shadow-[0_0_15px_rgba(224,200,139,0.3)] scale-105"
                          : "bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-[#E0C88B]/40"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#E0C88B]" />
                <Input
                  type="text"
                  placeholder="Search tickets, rooms, issues..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="glass-input pl-10 h-10 text-xs border-white/15 focus:border-[#E0C88B] rounded-xl"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Complaints List Container */}
            {loadingMyComplaints ? (
              <div className="py-4 space-y-4">
                <TableRowsSkeleton rows={4} />
              </div>
            ) : paginatedComplaints.length === 0 ? (
              <div className="text-center py-16 px-4 max-w-md mx-auto">
                <FileText className="w-12 h-12 text-[#E0C88B]/40 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white font-display mb-1">No Tickets Found</h3>
                <p className="text-xs text-slate-400 mb-6 font-sans">
                  {search
                    ? `No complaints match your search query "${search}".`
                    : "You currently have no maintenance complaints in this view."}
                </p>
                <Button
                  size="sm"
                  asChild
                  className="bg-[#E0C88B] text-[#060F10] hover:bg-[#F3E5AB] font-bold rounded-xl"
                >
                  <Link to="/register-complaint">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Report New Maintenance Issue
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedComplaints.map((c: ComplaintWithJoins) => {
                  const status = statusConfig[c.status] || {
                    label: c.status,
                    color: "text-slate-300",
                    bg: "bg-white/5",
                    border: "border-white/10",
                  };
                  const priority = priorityBadges[c.priority] || {
                    label: c.priority,
                    color: "text-slate-300 bg-white/5",
                    border: "border-white/10",
                  };

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#E0C88B]/40 hover:bg-white/[0.04] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Metadata & Title */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#E0C88B]">
                            {c.complaint_number}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.bg} ${status.color} ${status.border}`}>
                            {status.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono uppercase ${priority.color} ${priority.border}`}>
                            {priority.label}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-white font-display truncate">
                          {c.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-[#E0C88B]" />
                            {c.location}
                          </span>
                          <span>•</span>
                          <span>{c.departments?.name || "Campus Department"}</span>
                          <span>•</span>
                          <span>{format(new Date(c.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                        {c.status === "completed" ? (
                          <Button
                            size="sm"
                            onClick={() => setVerifyComplaint(c)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                          >
                            <Star className="w-4 h-4" />
                            <span>Verify & Rate</span>
                          </Button>
                        ) : null}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedComplaint(c)}
                          className="glass-panel text-slate-200 hover:text-white border-white/20 hover:border-[#E0C88B]/60 rounded-xl text-xs font-semibold px-4"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-[#E0C88B]" />
                          Inspect Details
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 pt-4 border-t border-white/10">
                <ComplaintsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredComplaints.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
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
      <VerifyCompletionModal
        complaint={verifyComplaint}
        open={!!verifyComplaint}
        onClose={() => setVerifyComplaint(null)}
      />
    </div>
  );
};

export default FacultyDashboard;
