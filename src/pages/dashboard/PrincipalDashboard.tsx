import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInHours, differenceInDays } from "date-fns";
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
  Eye,
  Download,
  Loader2,
  Building,
  TrendingUp,
  BarChart3,
  Users,
  AlertCircle,
  ArrowUpRight,
  Search,
  Filter,
  Sparkles,
  Building2,
  MapPin,
  X,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints, useComplaintStats, useDepartments } from "@/hooks/useComplaints";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import ComplaintsPagination from "@/components/complaints/ComplaintsPagination";
import useRealtimeComplaints from "@/hooks/useRealtimeComplaints";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Database } from "@/integrations/supabase/types";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  building_id?: string | null;
  departments?: { name: string } | null;
  maintenance_categories?: { name: string } | null;
  buildings?: { name: string } | null;
  complaint_updates?: Database['public']['Tables']['complaint_updates']['Row'][];
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30" },
  acknowledged: { label: "Acknowledged", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-400/30" },
  approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-400/30" },
  in_progress: { label: "In Progress", color: "text-[#E0C88B]", bg: "bg-amber-500/15", border: "border-[#E0C88B]/40" },
  completed: { label: "Completed", color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-400/40" },
  rejected: { label: "Rejected", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-400/30" },
  on_hold: { label: "On Hold", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-400/30" },
  closed: { label: "Closed", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
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

const LUXURY_PALETTE = ["#E0C88B", "#10B981", "#38BDF8", "#F43F5E", "#A855F7"];

const ITEMS_PER_PAGE = 8;

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { allComplaints, loadingAllComplaints } = useComplaints();
  const { data: stats, isLoading: loadingStats } = useComplaintStats();
  const { data: departments } = useDepartments();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "delayed" | "escalated">("all");

  useRealtimeComplaints();

  const allItems = (allComplaints as unknown as ComplaintWithJoins[]) || [];

  // Delayed and escalated counts
  const delayedCount = useMemo(() => {
    return allItems.filter((c) =>
      c.expected_resolution &&
      new Date(c.expected_resolution) < new Date() &&
      !["completed", "closed"].includes(c.status)
    ).length;
  }, [allItems]);

  const escalatedCount = useMemo(() => {
    return allItems.filter((c) =>
      c.priority === "critical" ||
      (c.priority === "high" && differenceInHours(new Date(), new Date(c.created_at)) > 48)
    ).length;
  }, [allItems]);

  // Average resolution time in days
  const avgResolutionTime = useMemo(() => {
    const resolved = allItems.filter((c) => c.resolved_at && c.created_at);
    if (resolved.length === 0) return 0;
    const totalDays = resolved.reduce((sum, c) => {
      return sum + differenceInDays(new Date(c.resolved_at!), new Date(c.created_at));
    }, 0);
    return Math.round(totalDays / resolved.length);
  }, [allItems]);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return allItems.filter((c) => {
      // Tab filtering
      if (activeTab === "delayed") {
        const isDelayed = c.expected_resolution && new Date(c.expected_resolution) < new Date() && !["completed", "closed"].includes(c.status);
        if (!isDelayed) return false;
      } else if (activeTab === "escalated") {
        const isEscalated = c.priority === "critical" || (c.priority === "high" && differenceInHours(new Date(), new Date(c.created_at)) > 48);
        if (!isEscalated) return false;
      }

      // Dropdown status filter
      if (statusFilter !== "all" && c.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;

      // Search query
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        c.complaint_number.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.departments?.name && c.departments.name.toLowerCase().includes(q)) ||
        (c.buildings?.name && c.buildings.name.toLowerCase().includes(q))
      );
    });
  }, [allItems, search, statusFilter, priorityFilter, activeTab]);

  // Paginate
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Department stats for chart
  const departmentStats = useMemo(() => {
    if (!departments) return [];
    return departments.map((dept: Database['public']['Tables']['departments']['Row']) => {
      const deptComplaints = allItems.filter((c) => c.department_id === dept.id);
      const completed = deptComplaints.filter((c) => ["completed", "closed"].includes(c.status)).length;
      return {
        name: dept.name.length > 14 ? dept.name.substring(0, 14) + "..." : dept.name,
        fullName: dept.name,
        total: deptComplaints.length,
        completed,
        pending: deptComplaints.filter((c) => c.status === "pending").length,
        rate: deptComplaints.length > 0 ? Math.round((completed / deptComplaints.length) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [allItems, departments]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Completed", value: stats.completed || 0 },
      { name: "In Progress", value: stats.in_progress || 0 },
      { name: "Pending", value: stats.pending || 0 },
      { name: "On Hold", value: stats.on_hold || 0 },
      { name: "Rejected", value: stats.rejected || 0 },
    ].filter(item => item.value > 0);
  }, [stats]);

  const handleExportPDF = () => {
    if (allItems.length === 0) return;
    exportToPDF(allItems, "principal-executive-report", "Principal Executive Facility Report");
  };

  const handleExportCSV = () => {
    if (allItems.length === 0) return;
    exportToCSV(allItems, "principal-incident-records");
  };

  // Stat cards with instant interactive filtering
  const statCards = [
    {
      id: "all",
      label: "Total Incidents",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-[#E0C88B]",
      bg: "bg-[#E0C88B]/15",
      border: "border-[#E0C88B]/30",
      tab: "all" as const,
    },
    {
      id: "delayed",
      label: "Delayed SLA Breaches",
      value: delayedCount,
      icon: AlertCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/15",
      border: "border-rose-400/30",
      tab: "delayed" as const,
    },
    {
      id: "in_progress",
      label: "In Active Repair",
      value: stats?.in_progress || 0,
      icon: AlertTriangle,
      color: "text-sky-400",
      bg: "bg-sky-500/15",
      border: "border-sky-400/30",
      tab: "all" as const,
    },
    {
      id: "resolved",
      label: "Resolved Incidents",
      value: (stats?.completed || 0) + (stats?.closed || 0),
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-400/30",
      tab: "all" as const,
    },
  ];

  return (
    <div className="relative z-10 min-h-screen text-foreground">
      {/* Radiant ambient glow orbs */}
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
                  Executive Command • Institutional Leadership
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                  Principal <span className="text-gradient-gold italic font-serif">Intelligence Deck</span>
                </h1>
                <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                  University-wide facility telemetry, department accountability metrics, and SLA compliance surveillance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ReportDownloadButton data={allItems} userRole="Principal" />
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="border-[#E0C88B]/30 text-[#E0C88B] hover:bg-[#E0C88B]/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Executive PDF
                </Button>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="border-white/15 text-slate-200 hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV Data
                </Button>
              </div>
            </div>
          </motion.div>

          {/* SLA Breach Alert Banner */}
          {delayedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-950/30 to-[#0B1416]/60 border border-rose-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(244,63,94,0.18)]"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 animate-pulse text-rose-300">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                        Institutional SLA Alert
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mt-1">
                      {delayedCount} university complaint{delayedCount > 1 ? "s have" : " has"} breached standard turnaround SLAs
                    </h3>
                    <p className="text-slate-300 text-xs md:text-sm mt-0.5">
                      Review delayed repairs and notify Department Heads for immediate escalation.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setActiveTab("delayed");
                    setCurrentPage(1);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/30"
                >
                  Review Delayed Queue
                  <ArrowUpRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Interactive Stat Cards */}
          {loadingStats ? (
            <DashboardStatsSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {statCards.map((stat, i) => {
                const isActive = activeTab === stat.tab && stat.id !== "in_progress" && stat.id !== "resolved";
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
                        {isActive ? "Filtered" : "Inspect"}
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

          {/* Key Executive Efficiency Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl glass-panel-dark border border-white/10">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Avg. Resolution Speed</span>
              <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">{avgResolutionTime} <span className="text-sm font-normal text-slate-400">days</span></p>
            </div>
            <div className="p-5 rounded-2xl glass-panel-dark border border-white/10">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Campus Resolution Rate</span>
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1">
                {stats?.total ? Math.round(((stats.completed || 0) / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="p-5 rounded-2xl glass-panel-dark border border-white/10">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Critical Escalations</span>
              <p className="text-2xl md:text-3xl font-extrabold text-amber-400 mt-1">{escalatedCount}</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel-dark border border-white/10">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Monitored Wings</span>
              <p className="text-2xl md:text-3xl font-extrabold text-sky-400 mt-1">{departments?.length || 0}</p>
            </div>
          </div>

          {/* Analytics Visualizations */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Department Performance Bar Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E0C88B]/15 border border-[#E0C88B]/30 flex items-center justify-center text-[#E0C88B]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Department Resolution Load</h2>
                    <p className="text-xs text-slate-400">Total vs Completed Repairs by Wing</p>
                  </div>
                </div>
              </div>

              {departmentStats.length > 0 ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0B1416",
                          border: "1px solid rgba(224,200,139,0.3)",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="total" name="Total Filed" fill="#E0C88B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
                  No department records found
                </div>
              )}
            </div>

            {/* Status Distribution Donut */}
            <div className="p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Incident Distribution</h2>
                  <p className="text-xs text-slate-400">Current ticket statuses</p>
                </div>
              </div>

              {statusDistribution.length > 0 ? (
                <div>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={LUXURY_PALETTE[index % LUXURY_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0B1416",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "10px",
                            color: "#fff",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                    {statusDistribution.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: LUXURY_PALETTE[index % LUXURY_PALETTE.length] }}
                        />
                        <span className="text-slate-300 truncate">{item.name}</span>
                        <span className="font-bold text-white ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-slate-500 text-sm">
                  No distribution data available
                </div>
              )}
            </div>
          </div>

          {/* Interactive Incident Dossier */}
          <div className="p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
            {/* Header Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Institutional Maintenance Dossier</h2>
                <p className="text-xs text-slate-400">Audit-ready complaint log with priority triage</p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { key: "all", label: "All Incidents", count: allItems.length },
                  { key: "delayed", label: "Delayed SLA", count: delayedCount },
                  { key: "escalated", label: "High Escalations", count: escalatedCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key as typeof activeTab);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-[#E0C88B] to-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === tab.key ? "bg-black/20 text-black font-extrabold" : "bg-white/10 text-slate-300"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Filters */}
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search complaint #, department, building, keyword..."
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

            {/* Table */}
            {loadingAllComplaints ? (
              <div className="py-4 px-2">
                <TableRowsSkeleton rows={5} />
              </div>
            ) : paginatedComplaints.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400/40 mx-auto mb-3" />
                <p className="text-white font-semibold">No complaints in this view</p>
                <p className="text-slate-400 text-xs mt-1">Try resetting filters or searching another keyword.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-3">Ticket ID</th>
                      <th className="py-3 px-3">Issue Title</th>
                      <th className="py-3 px-3">Wing / Dept</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Date Logged</th>
                      <th className="py-3 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedComplaints.map((complaint) => {
                      const pStyle = priorityStyles[complaint.priority] || priorityStyles.medium;
                      const sStyle = statusConfig[complaint.status] || statusConfig.pending;

                      return (
                        <tr
                          key={complaint.id}
                          className="hover:bg-white/5 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowDetails(true);
                          }}
                        >
                          <td className="py-3.5 px-3 font-mono font-bold text-[#E0C88B]">
                            {complaint.complaint_number}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-white max-w-xs truncate group-hover:text-[#E0C88B] transition-colors">
                            {complaint.title}
                          </td>
                          <td className="py-3.5 px-3 text-slate-300">
                            {complaint.departments?.name || "Campus Facility"}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${pStyle.badge}`}>
                              {pStyle.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sStyle.bg} ${sStyle.color} ${sStyle.border}`}>
                              {sStyle.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-400">
                            {format(new Date(complaint.created_at), "MMM d, yyyy")}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(complaint);
                                setShowDetails(true);
                              }}
                              className="text-slate-300 hover:text-white hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

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
        </div>
      </main>

      <Footer />

      {/* Complaint Details Modal */}
      <ComplaintDetailsModal
        complaint={selectedComplaint}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
};

export default PrincipalDashboard;
