import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReportDownloadButton } from "@/components/dashboard/ReportDownloadButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, TrendingUp, Calendar, Bell, Loader2, Eye, Star, ThumbsUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComplaints, useComplaintStats } from "@/hooks/useComplaints";
import { useRealtimeComplaints } from "@/hooks/useRealtimeComplaints";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import ComplaintDetailsModal from "@/components/complaints/ComplaintDetailsModal";
import VerifyCompletionModal from "@/components/complaints/VerifyCompletionModal";
import ComplaintFilters from "@/components/complaints/ComplaintFilters";
import ComplaintsPagination from "@/components/complaints/ComplaintsPagination";
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

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { myComplaints, loadingMyComplaints } = useComplaints();
  const { data: stats, isLoading: loadingStats } = useComplaintStats();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithJoins | null>(null);
  const [verifyComplaint, setVerifyComplaint] = useState<ComplaintWithJoins | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Enable real-time updates
  useRealtimeComplaints();

  // Complaints awaiting verification (completed status)
  const awaitingVerification = useMemo(() => {
    if (!myComplaints) return [];
    return myComplaints.filter((c: ComplaintWithJoins) => c.status === "completed");
  }, [myComplaints]);

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
    { label: "Total Complaints", value: stats?.total || 0, icon: FileText, color: "bg-primary" },
    { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "bg-warning" },
    { label: "In Progress", value: stats?.in_progress || 0, icon: AlertTriangle, color: "bg-info" },
    { label: "Completed", value: (stats?.completed || 0) + (stats?.closed || 0), icon: CheckCircle, color: "bg-success" },
  ];

  return (
    <div className="relative z-10 min-h-screen transparency-medium noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Faculty Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.email?.split("@")[0]}</p>
            </div>
            <div className="flex gap-2">
              <ReportDownloadButton data={myComplaints || []} userRole="Faculty" userName={user?.email || ""} />
              <Button variant="accent" asChild>
                <Link to="/register-complaint">
                  <Plus className="w-4 h-4 mr-2" />
                  New Complaint
                </Link>
              </Button>
            </div>
          </div>

          {/* Verification Alert */}
          {awaitingVerification.length > 0 && (
            <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <ThumbsUp className="w-5 h-5 text-success" />
                <span className="font-semibold text-foreground">{awaitingVerification.length} Completed - Awaiting Your Verification</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {awaitingVerification.slice(0, 2).map((complaint: ComplaintWithJoins) => (
                  <div key={complaint.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">{complaint.title}</p>
                      <p className="text-xs text-muted-foreground">{complaint.complaint_number}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => setVerifyComplaint(complaint)}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Verify
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
            <div className="lg:col-span-2 card-elevated p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Recent Complaints</h2>
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
                <div className="space-y-4">
                  {recentComplaints.map((complaint: ComplaintWithJoins) => (
                    <div
                      key={complaint.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{complaint.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {complaint.complaint_number} • {format(new Date(complaint.created_at), "MMM d")}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[complaint.status] || "bg-secondary"}>
                          {complaint.status.replace("_", " ")}
                        </Badge>
                        {complaint.status === "completed" ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => setVerifyComplaint(complaint)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedComplaint(complaint)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="ghost" className="w-full mt-4" asChild>
                <Link to="/track">View All Complaints</Link>
              </Button>
            </div>

            <div className="space-y-6">
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

              <div className="card-elevated p-6">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-accent" />
                  Recent Updates
                </h2>
                {recentComplaints.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent updates</p>
                ) : (
                  <div className="space-y-3 text-sm">
                    {recentComplaints.slice(0, 2).map((complaint: ComplaintWithJoins) => (
                      <div key={complaint.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-foreground font-medium">{complaint.complaint_number}</p>
                        <p className="text-muted-foreground capitalize">{complaint.status.replace("_", " ")}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {format(new Date(complaint.updated_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Complaints */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">All My Complaints</h2>
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
                      <div className="flex gap-2">
                        {complaint.status === "completed" && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => setVerifyComplaint(complaint)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
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
