import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TABLES } from "@/config/constants";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { DashboardStatsSkeleton, Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Building2,
  AlertCircle,
  BarChart3,
  Download,
  Settings,
  Loader2,
  Eye,
  UserCog,
  Wrench,
  Tag,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useComplaints, useComplaintStats, useDepartments, useCategories } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { exportToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import AssignStaffModal from "@/components/complaints/AssignStaffModal";
import DepartmentManagement from "@/components/admins/DepartmentManagement";
import SLAConfiguration from "@/components/admins/SLAConfiguration";
import { PredictiveAnalyticsWidget } from "@/components/dashboard/PredictiveAnalyticsWidget";
import { CampusHeatmap } from "@/components/dashboard/CampusHeatmap";
import { BulkImportModal } from "@/components/dashboard/BulkImportModal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Database } from "@/integrations/supabase/types";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
  profiles?: { full_name: string } | null;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { allComplaints, loadingAllComplaints } = useComplaints();
  const { data: stats, isLoading: loadingStats } = useComplaintStats();
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [assignComplaint, setAssignComplaint] = useState<ComplaintWithJoins | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Enable real-time updates
  useRealtimeComplaints();

  // Get department-wise stats
  const { data: departmentStats } = useQuery({
    queryKey: ["department-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.COMPLAINTS)
        .select("department_id, status");

      if (error) throw error;

      const deptMap = new Map();
      data.forEach((c: Database['public']['Tables']['complaints']['Row']) => {
        const deptId = c.department_id;
        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, { total: 0, completed: 0, pending: 0, in_progress: 0 });
        }
        const dept = deptMap.get(deptId);
        dept.total++;
        if (c.status === "completed" || c.status === "closed") dept.completed++;
        else if (c.status === "pending") dept.pending++;
        else if (c.status === "in_progress") dept.in_progress++;
      });

      return deptMap;
    },
  });

  // Get user counts
  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role");
      if (error) throw error;

      const counts: Record<string, number> = {
        faculty: 0,
        hod: 0,
        admin: 0,
        maintenance_staff: 0,
        principal: 0,
      };

      data.forEach((r: Database['public']['Tables']['user_roles']['Row']) => {
        if (counts[r.role] !== undefined) {
          counts[r.role]++;
        }
      });

      return counts;
    },
  });

  // Category stats
  const categoryStats = useQuery({
    queryKey: ["category-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.COMPLAINTS)
        .select("category_id, status");

      if (error) throw error;

      const catMap = new Map();
      data.forEach((c: Database['public']['Tables']['complaints']['Row']) => {
        if (!c.category_id) return;
        if (!catMap.has(c.category_id)) {
          catMap.set(c.category_id, { total: 0, completed: 0 });
        }
        const cat = catMap.get(c.category_id);
        cat.total++;
        if (["completed", "closed"].includes(c.status)) cat.completed++;
      });

      return catMap;
    },
  });

  const escalatedIssues = allComplaints?.filter(
    (c: ComplaintWithJoins) => c.priority === "critical" && c.status === "pending"
  ) || [];

  const handleExport = () => {
    if (!allComplaints || allComplaints.length === 0) {
      toast.error("No complaints to export");
      return;
    }
    exportToPDF(allComplaints, "unicare-full-report", "All Complaints Report");
    toast.success("Report exported as PDF");
  };

  // Chart data
  const deptChartData = departments?.map((dept: Database['public']['Tables']['departments']['Row']) => {
    const deptStat = departmentStats?.get(dept.id) || { total: 0, completed: 0 };
    return {
      name: dept.name.length > 12 ? dept.name.substring(0, 12) + "..." : dept.name,
      total: deptStat.total,
      completed: deptStat.completed,
    };
  }).slice(0, 6) || [];

  const catChartData = categories?.map((cat: Database['public']['Tables']['maintenance_categories']['Row']) => {
    const catStat = categoryStats.data?.get(cat.id) || { total: 0, completed: 0 };
    return {
      name: cat.name.length > 12 ? cat.name.substring(0, 12) + "..." : cat.name,
      total: catStat.total,
    };
  }).slice(0, 8) || [];

  const statCards = [
    {
      label: "Total Complaints",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-[#E0C88B]",
      bg: "bg-[#E0C88B]/15",
      border: "border-[#E0C88B]/30",
      trend: "+12%",
      path: "/dashboard/admin/all",
    },
    {
      label: "Pending Review",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-400/30",
      trend: "-8%",
      path: "/dashboard/admin/pending",
    },
    {
      label: "Active In Progress",
      value: stats?.in_progress || 0,
      icon: AlertTriangle,
      color: "text-sky-400",
      bg: "bg-sky-500/15",
      border: "border-sky-400/30",
      trend: "+5%",
      path: "/dashboard/admin/in-progress",
    },
    {
      label: "Total Resolved",
      value: (stats?.completed || 0) + (stats?.closed || 0),
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      border: "border-emerald-400/30",
      trend: "+15%",
      path: "/dashboard/admin/completed",
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
                  Master Controller • University Maintenance Cell
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                  Admin <span className="text-gradient-gold italic font-serif">Command Center</span>
                </h1>
                <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                  Centralized governance, department configurations, dynamic SLA triggers, technician dispatches, and predictive facility diagnostics.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <BulkImportModal />
                <ReportDownloadButton
                  data={allComplaints || []}
                  userRole="Admin"
                  userName={user?.email || "Administrator"}
                />
                <Button
                  variant="outline"
                  asChild
                  className="border-[#E0C88B]/30 text-[#E0C88B] hover:bg-[#E0C88B]/10"
                >
                  <Link to="/dashboard/admin/users">
                    <UserCog className="w-4 h-4 mr-2" />
                    User Directory
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-white/15 text-slate-200 hover:bg-white/10"
                >
                  <Link to="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Urgent Critical Issues Triage Strip */}
          {escalatedIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-950/30 to-[#0B1416]/60 border border-rose-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(244,63,94,0.18)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 animate-pulse text-rose-300">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base md:text-lg">
                    {escalatedIssues.length} Critical Issues Require Immediate Dispatch
                  </h3>
                  <p className="text-slate-300 text-xs">High hazard severity complaints awaiting staff assignment.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {escalatedIssues.slice(0, 2).map((issue: ComplaintWithJoins) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/40 transition-all"
                  >
                    <div>
                      <p className="font-bold text-white text-sm">{issue.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-[#E0C88B]">{issue.complaint_number}</span> • {issue.location}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setAssignComplaint(issue)}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      Take Action
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stat Cards */}
          {loadingStats ? (
            <DashboardStatsSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {statCards.map((stat, i) => (
                <Link key={i} to={stat.path} className="block group">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="p-5 md:p-6 rounded-2xl glass-panel-dark border border-white/10 hover:border-[#E0C88B]/40 transition-all duration-300 group-hover:scale-[1.02] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} border ${stat.border}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {stat.trend}
                      </span>
                    </div>

                    <div className="text-3xl md:text-4xl font-extrabold text-white mb-1 tracking-tight drop-shadow-md">
                      {stat.value}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Interactive Navigation Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="p-1.5 rounded-2xl glass-panel-dark border border-white/10 inline-flex">
              <TabsList className="bg-transparent border-none p-0 flex gap-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E0C88B] data-[state=active]:to-amber-500 data-[state=active]:text-black text-slate-300 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Campus Overview
                </TabsTrigger>
                <TabsTrigger
                  value="departments"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E0C88B] data-[state=active]:to-amber-500 data-[state=active]:text-black text-slate-300 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Departments
                </TabsTrigger>
                <TabsTrigger
                  value="sla"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E0C88B] data-[state=active]:to-amber-500 data-[state=active]:text-black text-slate-300 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  SLA Engine
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E0C88B] data-[state=active]:to-amber-500 data-[state=active]:text-black text-slate-300 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Reports Generator
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB: Campus Overview */}
            <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Department Overview Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E0C88B]/15 border border-[#E0C88B]/30 flex items-center justify-center text-[#E0C88B]">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Department Resolution Matrix</h2>
                        <p className="text-xs text-slate-400">Total reported vs resolved repairs</p>
                      </div>
                    </div>
                  </div>

                  {loadingAllComplaints ? (
                    <div className="space-y-3 py-6 px-4">
                      <Skeleton className="h-52 w-full rounded-2xl" />
                    </div>
                  ) : deptChartData.length > 0 ? (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
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
                    <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
                      No department data available
                    </div>
                  )}
                </div>

                {/* System Efficiency & User Roster */}
                <div className="space-y-6">
                  {/* System Efficiency */}
                  <div className="p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">System Efficiency</h2>
                        <p className="text-xs text-slate-400">Campus-wide KPIs</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-400">Overall Resolution Rate</span>
                          <span className="font-bold text-emerald-400">
                            {stats?.total ? Math.round(((stats.completed || 0) / stats.total) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#E0C88B] rounded-full transition-all duration-1000"
                            style={{ width: `${stats?.total ? ((stats.completed || 0) / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-400">Active Workload Rate</span>
                          <span className="font-bold text-sky-400">
                            {(stats?.pending || 0) + (stats?.in_progress || 0)} tasks
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-1000"
                            style={{
                              width: `${
                                stats?.total
                                  ? (((stats?.pending || 0) + (stats?.in_progress || 0)) / stats.total) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registered Personnel */}
                  <div className="p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Personnel Telemetry</h2>
                        <p className="text-xs text-slate-400">Registered campus roles</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: "Faculty Members", count: userStats?.faculty || 0 },
                        { label: "Department Heads", count: userStats?.hod || 0 },
                        { label: "Maintenance Technicians", count: userStats?.maintenance_staff || 0 },
                        { label: "Executive Leadership", count: userStats?.principal || 0 },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                        >
                          <span className="text-slate-300">{item.label}</span>
                          <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Chart */}
              <div className="p-6 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Complaints by Maintenance Category</h2>
                    <p className="text-xs text-slate-400">Volume distribution across infrastructure types</p>
                  </div>
                </div>

                {catChartData.length > 0 ? (
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={catChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={95} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0B1416",
                            border: "1px solid rgba(224,200,139,0.3)",
                            borderRadius: "10px",
                            color: "#fff",
                          }}
                        />
                        <Bar dataKey="total" fill="#E0C88B" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
                    No category data available
                  </div>
                )}
              </div>

              {/* Predictive Heatmap & Diagnostics */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CampusHeatmap />
                </div>
                <div>
                  <PredictiveAnalyticsWidget />
                </div>
              </div>
            </TabsContent>

            {/* TAB: Department Management */}
            <TabsContent value="departments" className="focus-visible:outline-none">
              <DepartmentManagement />
            </TabsContent>

            {/* TAB: SLA Engine */}
            <TabsContent value="sla" className="focus-visible:outline-none">
              <SLAConfiguration />
            </TabsContent>

            {/* TAB: Reports Generator */}
            <TabsContent value="reports" className="focus-visible:outline-none">
              <div className="p-8 rounded-2xl glass-panel-dark border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E0C88B]/15 border border-[#E0C88B]/30 flex items-center justify-center text-[#E0C88B]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Generate Audit-Ready Reports</h2>
                    <p className="text-xs text-slate-400">Download formatted institutional summaries and PDF archives</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div
                    onClick={handleExport}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E0C88B]/40 hover:bg-white/10 transition-all cursor-pointer group flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#E0C88B]/15 border border-[#E0C88B]/30 flex items-center justify-center text-[#E0C88B] mb-4 group-hover:scale-110 transition-transform">
                      <Download className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-white text-base">Full University Log</span>
                    <span className="text-xs text-slate-400 mt-1">Export complete complaint records as PDF</span>
                    <Button size="sm" className="mt-4 bg-[#E0C88B] text-black font-semibold hover:bg-amber-400">
                      Download PDF
                    </Button>
                  </div>

                  <div
                    onClick={() => {
                      const pending = allComplaints?.filter((c: ComplaintWithJoins) => c.status === "pending") || [];
                      if (pending.length === 0) {
                        toast.error("No pending complaints");
                        return;
                      }
                      exportToPDF(pending, "pending-complaints", "Pending Complaints Report");
                      toast.success("Pending complaints exported as PDF");
                    }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-white/10 transition-all cursor-pointer group flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                      <Clock className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-white text-base">Pending Approvals Only</span>
                    <span className="text-xs text-slate-400 mt-1">Export active triage backlogs</span>
                    <Button size="sm" variant="outline" className="mt-4 border-amber-400/40 text-amber-300 hover:bg-amber-500/10">
                      Export Pending
                    </Button>
                  </div>

                  <div
                    onClick={() => {
                      const completed = allComplaints?.filter((c: ComplaintWithJoins) => ["completed", "closed"].includes(c.status)) || [];
                      if (completed.length === 0) {
                        toast.error("No completed complaints");
                        return;
                      }
                      exportToPDF(completed, "completed-complaints", "Completed Complaints Report");
                      toast.success("Completed complaints exported as PDF");
                    }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/40 hover:bg-white/10 transition-all cursor-pointer group flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-white text-base">Resolved Archive</span>
                    <span className="text-xs text-slate-400 mt-1">Export verified completion certificates</span>
                    <Button size="sm" variant="outline" className="mt-4 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10">
                      Export Resolved
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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

export default AdminDashboard;
