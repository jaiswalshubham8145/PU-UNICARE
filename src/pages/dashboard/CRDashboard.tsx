import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  FileText, Clock, CheckCircle, AlertTriangle, Plus, Eye,
  Loader2, TrendingUp, Calendar, Bell, Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints, useComplaintStats } from "@/hooks/useComplaints";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import ComplaintFilters from "@/components/complaints/ComplaintFilters";
import ComplaintsPagination from "@/components/complaints/ComplaintsPagination";
import useRealtimeComplaints from "@/hooks/useRealtimeComplaints";
import type { Database } from "@/integrations/supabase/types";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
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

const ITEMS_PER_PAGE = 10;

const CRDashboard = () => {
  const { user } = useAuth();
  const { myComplaints, loadingMyComplaints } = useComplaints();
  const { data: stats, isLoading: loadingStats } = useComplaintStats();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useRealtimeComplaints();

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    if (!myComplaints) return [];
    return myComplaints.filter((c: ComplaintWithJoins) => {
      const matchesSearch = !search ||
        c.complaint_number.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [myComplaints, search, statusFilter, priorityFilter]);

  // Paginate
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const recentComplaints = myComplaints?.slice(0, 3) || [];

  const statCards = [
    { label: "Total Submitted", value: stats?.total || 0, icon: FileText, color: "bg-primary" },
    { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "bg-warning" },
    { label: "In Progress", value: stats?.in_progress || 0, icon: AlertTriangle, color: "bg-info" },
    { label: "Resolved", value: stats?.completed || 0, icon: CheckCircle, color: "bg-success" },
  ];

  return (
    <div className="relative z-10 min-h-screen transparency-medium noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Class Representative Dashboard</h1>
              <p className="text-muted-foreground">Submit and track complaints on behalf of students</p>
            </div>
            <div className="flex gap-2">
              <ReportDownloadButton data={myComplaints || []} userRole="Class Representative" userName={user?.email || ""} />
              <Button variant="accent" asChild>
                <Link to="/register-complaint">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Complaint
                </Link>
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="card-elevated p-4 mb-6 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Class Representative Role</p>
                <p className="text-sm text-muted-foreground">
                  As a CR, you can submit maintenance complaints on behalf of your class. Make sure to include accurate details and location information.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {loadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <div key={i} className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/register-complaint">
                    <Plus className="w-4 h-4 mr-2" />
                    Report New Issue
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/track">
                    <FileText className="w-4 h-4 mr-2" />
                    Track Complaints
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/maintenance">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Categories
                  </Link>
                </Button>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="lg:col-span-2 card-elevated p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Recent Updates
              </h2>
              {loadingMyComplaints ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : recentComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No complaints yet</p>
                  <Button variant="accent" size="sm" className="mt-4" asChild>
                    <Link to="/register-complaint">Submit Your First Complaint</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentComplaints.map((complaint: ComplaintWithJoins) => (
                    <div
                      key={complaint.id}
                      className="p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer"
                      onClick={() => { setSelectedComplaint(complaint); setShowDetails(true); }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{complaint.title}</span>
                        <Badge className={statusColors[complaint.status] || "bg-secondary"}>
                          {complaint.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {complaint.complaint_number} • Updated {format(new Date(complaint.updated_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All Complaints */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">My Submitted Complaints</h2>
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

              {loadingMyComplaints ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : paginatedComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No complaints found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedComplaints.map((complaint: ComplaintWithJoins) => (
                    <div
                      key={complaint.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-accent">{complaint.complaint_number}</span>
                          <Badge className={statusColors[complaint.status] || "bg-secondary"}>
                            {complaint.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="font-medium text-foreground">{complaint.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {complaint.departments?.name} • {format(new Date(complaint.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedComplaint(complaint); setShowDetails(true); }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
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

export default CRDashboard;