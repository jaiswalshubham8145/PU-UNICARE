import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Clock, CheckCircle, AlertTriangle, Eye, Download,
  Loader2, Building, TrendingUp, BarChart3, Users, AlertCircle, ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints, useComplaintStats, useDepartments } from "@/hooks/useComplaints";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { useState, useMemo } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import ComplaintFilters from "@/components/complaints/ComplaintFilters";
import ComplaintsPagination from "@/components/complaints/ComplaintsPagination";
import useRealtimeComplaints from "@/hooks/useRealtimeComplaints";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Database } from "@/integrations/supabase/types";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  building_id?: string | null;
  departments?: { name: string } | null;
  maintenance_categories?: { name: string } | null;
  buildings?: { name: string } | null; // Removed | any
  complaint_updates?: Database['public']['Tables']['complaint_updates']['Row'][];
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  acknowledged: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
  in_progress: "bg-accent/10 text-accent",
  completed: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  on_hold: "bg-warning/10 text-warning",
  closed: "bg-secondary text-muted-foreground",
};

const CHART_COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--destructive))", "hsl(var(--accent))"];

const ITEMS_PER_PAGE = 10;

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

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    if (!allComplaints) return [];

    let filtered = (allComplaints as unknown as ComplaintWithJoins[]);

    // Tab filtering
    if (activeTab === "delayed") {
      filtered = filtered.filter((c: ComplaintWithJoins) =>
        c.expected_resolution &&
        new Date(c.expected_resolution) < new Date() &&
        !["completed", "closed"].includes(c.status)
      );
    } else if (activeTab === "escalated") {
      filtered = filtered.filter((c: ComplaintWithJoins) =>
        c.priority === "critical" ||
        (c.priority === "high" && differenceInHours(new Date(), new Date(c.created_at)) > 48)
      );
    }

    return filtered.filter((c: ComplaintWithJoins) => {
      const matchesSearch = !search ||
        c.complaint_number.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [allComplaints, search, statusFilter, priorityFilter, activeTab]);

  // Paginate
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Department stats
  const departmentStats = useMemo(() => {
    if (!allComplaints || !departments) return [];
    const complaints = allComplaints as unknown as ComplaintWithJoins[];
    return departments.map((dept: Database['public']['Tables']['departments']['Row']) => {
      const deptComplaints = complaints.filter((c: ComplaintWithJoins) => c.department_id === dept.id);
      const completed = deptComplaints.filter((c: ComplaintWithJoins) => ["completed", "closed"].includes(c.status)).length;
      return {
        name: dept.name.length > 15 ? dept.name.substring(0, 15) + "..." : dept.name,
        fullName: dept.name,
        total: deptComplaints.length,
        completed,
        pending: deptComplaints.filter((c: ComplaintWithJoins) => c.status === "pending").length,
        rate: deptComplaints.length > 0 ? Math.round((completed / deptComplaints.length) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [allComplaints, departments]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Completed", value: stats.completed || 0 },
      { name: "Pending", value: stats.pending || 0 },
      { name: "In Progress", value: stats.in_progress || 0 },
      { name: "Rejected", value: stats.rejected || 0 },
      { name: "On Hold", value: stats.on_hold || 0 },
    ].filter(item => item.value > 0);
  }, [stats]);

  // Delayed and escalated counts
  const delayedCount = useMemo(() => {
    if (!allComplaints) return 0;
    const complaints = allComplaints as unknown as ComplaintWithJoins[];
    return complaints.filter((c: ComplaintWithJoins) =>
      c.expected_resolution &&
      new Date(c.expected_resolution) < new Date() &&
      !["completed", "closed"].includes(c.status)
    ).length;
  }, [allComplaints]);

  const escalatedCount = useMemo(() => {
    if (!allComplaints) return 0;
    const complaints = allComplaints as unknown as ComplaintWithJoins[];
    return complaints.filter((c: ComplaintWithJoins) =>
      c.priority === "critical" ||
      (c.priority === "high" && differenceInHours(new Date(), new Date(c.created_at)) > 48)
    ).length;
  }, [allComplaints]);

  // Average resolution time
  const avgResolutionTime = useMemo(() => {
    if (!allComplaints) return 0;
    const complaints = allComplaints as unknown as ComplaintWithJoins[];
    const resolved = complaints.filter((c: ComplaintWithJoins) => c.resolved_at && c.created_at);
    if (resolved.length === 0) return 0;
    const totalDays = resolved.reduce((sum: number, c: ComplaintWithJoins) => {
      return sum + differenceInDays(new Date(c.resolved_at!), new Date(c.created_at));
    }, 0);
    return Math.round(totalDays / resolved.length);
  }, [allComplaints]);

  const handleExport = () => {
    if (!allComplaints) return;
    exportToPDF(allComplaints, "principal-complaints-report", "Principal Dashboard Report");
  };

  const statCards = [
    { label: "Total Complaints", value: stats?.total || 0, icon: FileText, color: "bg-primary", path: "/dashboard/principal/all" },
    { label: "Delayed", value: delayedCount, icon: AlertCircle, color: "bg-destructive", path: "/dashboard/principal/delayed" },
    { label: "In Progress", value: stats?.in_progress || 0, icon: AlertTriangle, color: "bg-info", path: "/dashboard/principal/in-progress" },
    { label: "Resolved", value: (stats?.completed || 0) + (stats?.closed || 0), icon: CheckCircle, color: "bg-success", path: "/dashboard/principal/resolved" },
  ];

  return (
    <div className="relative z-10 min-h-screen transparency-medium noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Principal Dashboard</h1>
              <p className="text-muted-foreground">University-wide maintenance monitoring & analytics</p>
            </div>
            <div className="flex gap-2">
              <ReportDownloadButton data={allComplaints || []} userRole="Principal" />
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Alert for delayed complaints */}
          {delayedCount > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">{delayedCount} Delayed Complaints</p>
                  <p className="text-sm text-muted-foreground">These complaints have exceeded their expected resolution date</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { setActiveTab("delayed"); setCurrentPage(1); }}
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Stats Cards */}
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
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Analytics Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Department Performance Chart */}
            <div className="lg:col-span-2 card-elevated p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Department Performance
              </h2>
              {departmentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentStats.slice(0, 6)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </div>

            {/* Status Distribution */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-accent" />
                Status Distribution
              </h2>
              {statusDistribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {statusDistribution.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium text-foreground ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card-elevated p-4">
              <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
              <p className="text-2xl font-bold text-foreground">{avgResolutionTime} days</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
              <p className="text-2xl font-bold text-success">
                {stats?.total ? Math.round(((stats.completed || 0) / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-muted-foreground">Escalated Issues</p>
              <p className="text-2xl font-bold text-warning">{escalatedCount}</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold text-foreground">{departments?.length || 0}</p>
            </div>
          </div>

          {/* All Complaints with Tabs */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-foreground">Complaints Overview</h2>
                <div className="flex gap-2">
                  {[
                    { key: "all", label: "All", count: allComplaints?.length || 0 },
                    { key: "delayed", label: "Delayed", count: delayedCount },
                    { key: "escalated", label: "Escalated", count: escalatedCount },
                  ].map((tab) => (
                    <Button
                      key={tab.key}
                      variant={activeTab === tab.key ? "accent" : "outline"}
                      size="sm"
                      onClick={() => { setActiveTab(tab.key as "all" | "delayed" | "escalated"); setCurrentPage(1); }}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <Badge className="ml-2 bg-secondary text-foreground">{tab.count}</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
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

              {loadingAllComplaints ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : paginatedComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No complaints found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium text-muted-foreground">ID</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Title</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Department</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Priority</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-3 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedComplaints.map((complaint: ComplaintWithJoins) => (
                        <tr key={complaint.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 font-medium text-accent">{complaint.complaint_number}</td>
                          <td className="py-3 text-foreground max-w-xs truncate">{complaint.title}</td>
                          <td className="py-3 text-muted-foreground">{complaint.departments?.name}</td>
                          <td className="py-3">
                            <Badge className={
                              complaint.priority === "critical" ? "bg-destructive/10 text-destructive" :
                                complaint.priority === "high" ? "bg-orange-500/10 text-orange-500" :
                                  complaint.priority === "medium" ? "bg-warning/10 text-warning" :
                                    "bg-success/10 text-success"
                            }>
                              {complaint.priority}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge className={statusColors[complaint.status] || "bg-secondary"}>
                              {complaint.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {format(new Date(complaint.created_at), "MMM d, yyyy")}
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedComplaint(complaint); setShowDetails(true); }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

      <ComplaintDetailsModal
        complaint={selectedComplaint}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
};

export default PrincipalDashboard;
