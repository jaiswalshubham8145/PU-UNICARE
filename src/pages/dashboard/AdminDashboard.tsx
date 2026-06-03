import { useState } from "react";
import { TABLES } from "@/config/constants";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FileText, Clock, CheckCircle, AlertTriangle, Users, Building2, AlertCircle, BarChart3, Download, Settings, Loader2, Eye, UserCog, Wrench, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useComplaints, useComplaintStats, useDepartments, useCategories } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import AssignStaffModal from "@/components/complaints/AssignStaffModal";
import DepartmentManagement from "@/components/admins/DepartmentManagement";
import SLAConfiguration from "@/components/admins/SLAConfiguration";
import { PredictiveAnalyticsWidget } from "@/components/dashboard/PredictiveAnalyticsWidget";
import { CampusHeatmap } from "@/components/dashboard/CampusHeatmap";
import { BulkImportModal } from "@/components/dashboard/BulkImportModal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
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
        cr: 0,
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
      name: dept.name.length > 10 ? dept.name.substring(0, 10) + "..." : dept.name,
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
    { label: "Total Complaints", value: stats?.total || 0, icon: FileText, color: "bg-primary", trend: "+12%", path: "/dashboard/admin/all" },
    { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "bg-warning", trend: "-8%", path: "/dashboard/admin/pending" },
    { label: "In Progress", value: stats?.in_progress || 0, icon: AlertTriangle, color: "bg-info", trend: "+5%", path: "/dashboard/admin/in-progress" },
    { label: "Completed", value: (stats?.completed || 0) + (stats?.closed || 0), icon: CheckCircle, color: "bg-success", trend: "+15%", path: "/dashboard/admin/completed" },
  ];

  return (
    <div className="relative z-10 min-h-screen transparency-medium noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">University Maintenance Cell - Complete Control</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <BulkImportModal />
              <ReportDownloadButton data={allComplaints || []} userRole="Admin" userName={user?.email || "Administrator"} />
              <Button variant="outline" asChild>
                <Link to="/dashboard/admin/users">
                  <UserCog className="w-4 h-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {escalatedIssues.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-foreground">{escalatedIssues.length} Critical Issues Require Attention</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {escalatedIssues.slice(0, 2).map((issue: ComplaintWithJoins) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">{issue.complaint_number} • {issue.location}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setAssignComplaint(issue)}
                    >
                      Take Action
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <Link key={i} to={stat.path} className="block">
                  <div className="card-elevated p-6 cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Tabs for different admin sections */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="sla">SLA Rules</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-elevated p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-accent" />
                    Department Overview
                  </h2>
                  {loadingAllComplaints ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                  ) : deptChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={deptChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" name="Completed" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="card-elevated p-6">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-accent" />
                      System Performance
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Resolution Rate</span>
                          <span className="font-semibold text-foreground">
                            {stats?.total ? Math.round(((stats.completed || 0) / stats.total) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full"
                            style={{ width: `${stats?.total ? ((stats.completed || 0) / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Active Complaints</span>
                          <span className="font-semibold text-foreground">{(stats?.pending || 0) + (stats?.in_progress || 0)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-info rounded-full"
                            style={{ width: `${stats?.total ? (((stats?.pending || 0) + (stats?.in_progress || 0)) / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-elevated p-6">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent" />
                      User Statistics
                    </h2>
                    <div className="space-y-3">
                      {[
                        { label: "Faculty", count: userStats?.faculty || 0 },
                        { label: "HODs", count: userStats?.hod || 0 },
                        { label: "Maintenance Staff", count: userStats?.maintenance_staff || 0 },
                        { label: "Class Representatives", count: userStats?.cr || 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-bold text-foreground">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="card-elevated p-6 mt-6">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-accent" />
                  Complaints by Category
                </h2>
                {catChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={catChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={90} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="total" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    No category data available
                  </div>
                )}
              </div>

              {/* Phase 2: Analytics & Map */}
              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <CampusHeatmap />
                </div>
                <div>
                  <PredictiveAnalyticsWidget />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="departments">
              <DepartmentManagement />
            </TabsContent>

            <TabsContent value="sla">
              <SLAConfiguration />
            </TabsContent>

            <TabsContent value="reports">
              <div className="card-elevated p-6">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Generate Reports
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={handleExport}>
                    <Download className="w-8 h-8 text-accent" />
                    <span className="font-medium">All Complaints</span>
                    <span className="text-xs text-muted-foreground">Export full complaint data</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col gap-2"
                    onClick={() => {
                      const pending = allComplaints?.filter((c: ComplaintWithJoins) => c.status === "pending") || [];
                      if (pending.length === 0) {
                        toast.error("No pending complaints");
                        return;
                      }
                      exportToPDF(pending, "pending-complaints", "Pending Complaints Report");
                      toast.success("Pending complaints exported as PDF");
                    }}
                  >
                    <Clock className="w-8 h-8 text-warning" />
                    <span className="font-medium">Pending Only</span>
                    <span className="text-xs text-muted-foreground">Export pending complaints</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col gap-2"
                    onClick={() => {
                      const completed = allComplaints?.filter((c: ComplaintWithJoins) => ["completed", "closed"].includes(c.status)) || [];
                      if (completed.length === 0) {
                        toast.error("No completed complaints");
                        return;
                      }
                      exportToPDF(completed, "completed-complaints", "Completed Complaints Report");
                      toast.success("Completed complaints exported as PDF");
                    }}
                  >
                    <CheckCircle className="w-8 h-8 text-success" />
                    <span className="font-medium">Completed Only</span>
                    <span className="text-xs text-muted-foreground">Export resolved complaints</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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

export default AdminDashboard;
