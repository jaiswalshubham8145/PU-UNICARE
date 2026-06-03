import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, CheckCircle, AlertCircle, Loader2, Calendar, MapPin, User, XCircle, ThumbsUp, Pause, Archive, Share2 } from "lucide-react";
import { useComplaintByNumber } from "@/hooks/useComplaints";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
  complaint_updates: Database['public']['Tables']['complaint_updates']['Row'][];
};

const statusConfig = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Pending" },
  acknowledged: { icon: ThumbsUp, color: "text-info", bg: "bg-info/10", label: "Acknowledged" },
  approved: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Approved" },
  in_progress: { icon: Loader2, color: "text-accent", bg: "bg-accent/10", label: "In Progress" },
  completed: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Completed" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejected" },
  on_hold: { icon: Pause, color: "text-warning", bg: "bg-warning/10", label: "On Hold" },
  closed: { icon: Archive, color: "text-muted-foreground", bg: "bg-secondary", label: "Closed" },
};

const TrackComplaint = () => {
  const location = useLocation();
  const [searchId, setSearchId] = useState("");
  const [queryId, setQueryId] = useState("");

  const { data: complaint, isLoading, error } = useComplaintByNumber(queryId);

  useEffect(() => {
    const state = location.state as { complaintNumber?: string } | null;
    const searchParams = new URLSearchParams(location.search);
    const idParam = searchParams.get('id');

    if (state?.complaintNumber) {
      setSearchId(state.complaintNumber);
      setQueryId(state.complaintNumber);
    } else if (idParam) {
      setSearchId(idParam);
      setQueryId(idParam);
    }
  }, [location.state, location.search]);

  const handleSearch = () => {
    if (searchId.trim()) {
      setQueryId(searchId.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusHistory = () => {
    if (!complaint) return [];

    const history = [
      {
        date: complaint.created_at,
        status: "Submitted",
        note: "Complaint registered successfully",
      },
    ];

    if (complaint.complaint_updates && Array.isArray(complaint.complaint_updates)) {
      complaint.complaint_updates.forEach((update: Database['public']['Tables']['complaint_updates']['Row']) => {
        history.push({
          date: update.created_at,
          status: statusConfig[update.status as keyof typeof statusConfig]?.label || update.status,
          note: update.note || `Status updated to ${update.status}`,
        });
      });
    }

    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const handleShare = async () => {
    if (!complaint) return;
    
    const url = `${window.location.origin}/track?id=${complaint.complaint_number}`;
    const title = `Track Complaint: ${complaint.complaint_number}`;
    const text = `Check the status of complaint "${complaint.title}" on PU Unicare.`;

    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.log("Error sharing", error);
          navigator.clipboard.writeText(url);
          toast.success("Tracking link copied to clipboard!");
        }
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success("Tracking link copied to clipboard!");
    }
  };

  return (
    <div className="relative z-10 min-h-screen">
      <Navbar />
      <main className="pt-16">
        <section className="py-16 glass-low noise-texture">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center glass-panel-track rounded-2xl p-8">
              <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-6">
                <Search className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-medium">Track Status</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 glass-text-bg text-primary">Track Your Complaint</h1>
              <p className="text-primary/80 mb-8 font-medium">
                Enter your complaint ID to view real-time status and updates.
              </p>

              <div className="flex gap-3 max-w-md mx-auto">
                <Input
                  placeholder="Enter Complaint ID (e.g., UC-2025-0001)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white/50 border-primary/20 text-primary placeholder:text-primary/60 font-medium"
                />
                <Button variant="accent" onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 glass-low noise-texture">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : error ? (
              <div className="max-w-md mx-auto text-center py-12">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Error</h3>
                <p className="text-muted-foreground text-sm">Failed to fetch complaint details.</p>
              </div>
            ) : complaint ? (
              <div className="max-w-4xl mx-auto">
                <div className="card-elevated p-6 mb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="text-sm text-muted-foreground">Complaint ID</span>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-foreground">{complaint.complaint_number}</h2>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handleShare} title="Share Status">
                          <Share2 className="w-4 h-4 text-accent" />
                        </Button>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[complaint.status as keyof typeof statusConfig]?.bg || "bg-secondary"}`}>
                      {(() => {
                        const config = statusConfig[complaint.status as keyof typeof statusConfig];
                        if (!config) return null;
                        const Icon = config.icon;
                        return <Icon className={`w-4 h-4 ${config.color}`} />;
                      })()}
                      <span className={`font-medium ${statusConfig[complaint.status as keyof typeof statusConfig]?.color || "text-foreground"}`}>
                        {statusConfig[complaint.status as keyof typeof statusConfig]?.label || complaint.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-4">{complaint.title}</h3>
                  <p className="text-muted-foreground mb-6">{complaint.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">{complaint.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">
                        {complaint.departments?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">
                        {format(new Date(complaint.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    {complaint.expected_resolution && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-muted-foreground">
                          Due: {format(new Date(complaint.expected_resolution), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>

                  {complaint.image_urls && complaint.image_urls.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-foreground mb-3">Attached Images</h4>
                      <div className="flex gap-3 flex-wrap">
                        {complaint.image_urls.map((url: string, index: number) => (
                          <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Attachment ${index + 1}`} className="w-24 h-24 object-cover rounded-lg border border-border hover:border-accent transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-elevated p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">Progress Timeline</h3>
                  <div className="space-y-6">
                    {getStatusHistory().map((update, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === getStatusHistory().length - 1 ? "bg-accent text-accent-foreground" : "bg-success/20 text-success"
                            }`}>
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          {index < getStatusHistory().length - 1 && <div className="w-0.5 h-full bg-border flex-1 my-2" />}
                        </div>
                        <div className="pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{update.status}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(update.date), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{update.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : queryId ? (
              <div className="max-w-md mx-auto text-center py-12">
                <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Complaint Not Found</h3>
                <p className="text-muted-foreground text-sm">No complaint found with ID "{queryId}".</p>
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Search for a Complaint</h3>
                <p className="text-muted-foreground text-sm">Enter your complaint ID above to view its status.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TrackComplaint;
