import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  User,
  XCircle,
  ThumbsUp,
  Pause,
  Archive,
  Share2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
} from "lucide-react";
import { useComplaintByNumber } from "@/hooks/useComplaints";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type ComplaintWithJoins = Database['public']['Tables']['complaints']['Row'] & {
  departments: { name: string } | null;
  maintenance_categories: { name: string } | null;
  complaint_updates: Database['public']['Tables']['complaint_updates']['Row'][];
};

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/20", label: "Pending" },
  acknowledged: { icon: ThumbsUp, color: "text-sky-400", bg: "bg-sky-500/20", label: "Acknowledged" },
  approved: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Approved" },
  in_progress: { icon: Loader2, color: "text-[#E0C88B]", bg: "bg-amber-500/20", label: "In Progress" },
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Completed" },
  rejected: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/20", label: "Rejected" },
  on_hold: { icon: Pause, color: "text-amber-400", bg: "bg-amber-500/20", label: "On Hold" },
  closed: { icon: Archive, color: "text-slate-400", bg: "bg-slate-500/20", label: "Closed" },
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
      navigator.clipboard.writeText(url);
      toast.success("Tracking link copied to clipboard!");
    }
  };

  return (
    <div className="relative z-10 min-h-screen text-foreground selection:bg-[#E0C88B]/30 selection:text-[#F7F2E7] overflow-x-hidden">
      <Navbar />

      {/* Radiant Ambient Glows & Translucent Video Backdrop */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B0D]/45 via-transparent to-[#0B1416]/55" />
        <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-[#E0C88B]/18 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 left-1/4 w-[550px] h-[550px] bg-emerald-500/18 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-10 w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-[130px]" />
      </div>

      <main className="pt-24 pb-20">
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Search Box Card */}
            <div className="max-w-3xl mx-auto text-center rounded-3xl p-8 md:p-12 glass-panel-dark border border-white/15 dark:border-[#E0C88B]/30 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_35px_rgba(224,200,139,0.18)] relative overflow-hidden backdrop-blur-2xl">
              {/* Radiant background glow inside card */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#E0C88B]/12 rounded-full blur-3xl pointer-events-none" />

              {/* Badge */}
              <div className="inline-flex items-center gap-2 glass-panel border-[#E0C88B]/40 bg-[#E0C88B]/10 px-4 py-1.5 rounded-full mb-6 shadow-[0_0_15px_rgba(224,200,139,0.2)]">
                <Search className="w-4 h-4 text-[#E0C88B]" />
                <span className="text-[#F7F2E7] text-xs md:text-sm font-semibold tracking-[0.25em] uppercase font-mono">
                  Live Ticket Telemetry
                </span>
              </div>

              {/* Title with Combo 1 Clash Display + Combo 4 Italic Accent */}
              <h1 className="font-display text-3xl md:text-6xl font-black mb-4 text-white tracking-tight drop-shadow-md">
                Track Your <span className="text-gradient-gold italic-editorial font-normal">Complaint</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-200 text-sm md:text-lg mb-8 max-w-xl mx-auto leading-relaxed font-sans font-normal">
                Enter your unique complaint reference ID to view real-time status milestones, assigned technicians, and photo verification proofs.
              </p>

              {/* Search input & action button */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-[#E0C88B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    placeholder="Enter ID (e.g. PU-2026-1042)"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-14 pl-12 pr-4 text-base glass-input border-white/20 text-white placeholder:text-slate-400 focus:border-[#E0C88B] focus:ring-2 focus:ring-[#E0C88B]/30 rounded-2xl shadow-inner font-mono tracking-wider"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-14 px-8 rounded-2xl font-black text-base bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] text-[#060F10] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] shadow-[0_0_25px_rgba(224,200,139,0.5)] transition-all hover:scale-105 shrink-0 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Track <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {isLoading ? (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <div className="rounded-3xl p-8 border border-white/15 glass-panel-dark space-y-6 shadow-2xl">
                  <div className="flex justify-between items-start pb-6 border-b border-white/10">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-8 w-56 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-28 rounded-full" />
                  </div>
                  {/* Progress timeline skeleton */}
                  <div className="py-4">
                    <div className="flex justify-between items-center gap-2 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="max-w-md mx-auto text-center py-12 p-8 rounded-3xl glass-panel-dark border border-destructive/40 backdrop-blur-xl">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 font-display">Communication Error</h3>
                <p className="text-slate-300 text-sm font-sans">Failed to fetch complaint details. Please check the network connection and try again.</p>
              </div>
            ) : complaint ? (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="rounded-3xl p-8 border border-white/15 dark:border-[#E0C88B]/30 glass-panel-dark backdrop-blur-2xl shadow-[0_15px_45px_rgba(0,0,0,0.7),0_0_30px_rgba(224,200,139,0.15)]">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#E0C88B] uppercase tracking-widest">Complaint Reference ID</span>
                      <div className="flex items-center gap-3 mt-1">
                        <h2 className="text-2xl md:text-3xl font-mono font-black text-white tracking-wide">{complaint.complaint_number}</h2>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-white/20 text-[#E0C88B] hover:bg-white/10" onClick={handleShare} title="Share Status">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig[complaint.status as keyof typeof statusConfig]?.bg || "bg-secondary"} border-white/15 shadow-sm`}>
                      {(() => {
                        const config = statusConfig[complaint.status as keyof typeof statusConfig];
                        if (!config) return null;
                        const Icon = config.icon;
                        return <Icon className={`w-4 h-4 ${config.color}`} />;
                      })()}
                      <span className={`font-bold text-sm ${statusConfig[complaint.status as keyof typeof statusConfig]?.color || "text-white"}`}>
                        {statusConfig[complaint.status as keyof typeof statusConfig]?.label || complaint.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 font-display">{complaint.title}</h3>
                  <p className="text-slate-200 text-base leading-relaxed mb-6 bg-white/[0.04] p-4 rounded-2xl border border-white/10 font-sans">{complaint.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#E0C88B] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Location</p>
                        <p className="text-white font-medium truncate">{complaint.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Department</p>
                        <p className="text-white font-medium truncate">{complaint.departments?.name || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Submitted On</p>
                        <p className="text-white font-medium">{format(new Date(complaint.created_at), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    {complaint.expected_resolution && (
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">SLA Target</p>
                          <p className="text-white font-medium">{format(new Date(complaint.expected_resolution), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {complaint.image_urls && complaint.image_urls.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h4 className="text-xs font-mono font-bold text-[#E0C88B] mb-3 uppercase tracking-wider">Attached Verification Evidence</h4>
                      <div className="flex gap-3 flex-wrap">
                        {complaint.image_urls.map((url: string, index: number) => (
                          <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Attachment ${index + 1}`} className="w-24 h-24 object-cover rounded-xl border border-white/20 hover:border-[#E0C88B] transition-all hover:scale-105 shadow-md" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Timeline */}
                <div className="rounded-3xl p-8 border border-white/15 dark:border-[#E0C88B]/30 glass-panel-dark backdrop-blur-2xl shadow-[0_15px_45px_rgba(0,0,0,0.7),0_0_30px_rgba(224,200,139,0.15)]">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-display">
                    <Clock className="w-5 h-5 text-[#E0C88B]" />
                    Resolution Progress Timeline
                  </h3>
                  <div className="space-y-6">
                    {getStatusHistory().map((update, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                            index === getStatusHistory().length - 1
                              ? "bg-gradient-to-r from-[#C2A05A] to-[#E0C88B] text-black border-transparent shadow-[0_0_15px_rgba(224,200,139,0.5)]"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                          }`}>
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          {index < getStatusHistory().length - 1 && <div className="w-0.5 h-full bg-white/15 flex-1 my-2" />}
                        </div>
                        <div className="pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-base">{update.status}</span>
                            <span className="text-xs text-slate-400 font-mono">
                              • {format(new Date(update.date), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 font-sans">{update.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : queryId ? (
              <div className="max-w-md mx-auto text-center py-12 p-8 rounded-3xl glass-panel-dark border border-amber-400/40 backdrop-blur-xl">
                <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 font-display">Complaint Not Found</h3>
                <p className="text-slate-300 text-sm font-sans">No ticket found with ID "{queryId}". Please verify the ticket code and try again.</p>
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center py-12 p-8 rounded-3xl glass-panel-dark border border-white/15 backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-[#E0C88B]/10 border border-[#E0C88B]/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(224,200,139,0.2)]">
                  <Search className="w-8 h-8 text-[#E0C88B]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">Ready to Track</h3>
                <p className="text-slate-300 text-sm font-sans">Enter your complaint reference ID above to check its status in real time.</p>
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
