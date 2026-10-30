import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Clock,
  CheckCircle,
  ShieldCheck,
  Bell,
  Search,
  Zap,
  Activity,
  Sparkles,
  Radio,
  ExternalLink,
  Mic,
} from "lucide-react";
import { InteractiveTiltCard } from "@/components/ui/InteractiveTiltCard";
import { toast } from "sonner";
import VoiceComplaintAssistant from "@/components/chat/VoiceComplaintAssistant";

interface StatItem {
  icon: typeof Clock;
  value: string;
  label: string;
  detail: string;
  color: string;
  bg: string;
  border: string;
  shadow: string;
}

const statsConfig: StatItem[] = [
  {
    icon: Clock,
    value: "24hrs",
    label: "Acknowledgment",
    detail: "Guaranteed HOD & maintenance supervisor triage within 24 hours of ticket submission.",
    color: "#E0C88B",
    bg: "from-[#E0C88B]/25 to-[#C2A05A]/10",
    border: "border-[#E0C88B]/40",
    shadow: "shadow-[0_0_25px_rgba(224,200,139,0.25)]",
  },
  {
    icon: CheckCircle,
    value: "98%",
    label: "Resolution Rate",
    detail: "Over 4,200+ campus issues resolved across classrooms, labs, and student facilities this year.",
    color: "#34D399",
    bg: "from-emerald-400/25 to-emerald-600/10",
    border: "border-emerald-400/40",
    shadow: "shadow-[0_0_25px_rgba(52,211,153,0.25)]",
  },
  {
    icon: Bell,
    value: "Instant",
    label: "Notifications",
    detail: "Real-time dispatch alerts and resolution milestones transmitted via WhatsApp, Email & SMS.",
    color: "#60A5FA",
    bg: "from-sky-400/25 to-blue-600/10",
    border: "border-sky-400/40",
    shadow: "shadow-[0_0_25px_rgba(96,165,250,0.25)]",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Accountability",
    detail: "Immutable audit trail with tamper-proof photo verification uploaded before ticket closure.",
    color: "#F59E0B",
    bg: "from-amber-400/25 to-amber-600/10",
    border: "border-amber-400/40",
    shadow: "shadow-[0_0_25px_rgba(245,158,11,0.25)]",
  },
];

const sampleTickets = ["PU-2026-1042", "PU-2026-0819", "PU-2026-0941"];

const HeroSection = () => {
  const navigate = useNavigate();
  const [ticketInput, setTicketInput] = useState("");
  const [activeStatIndex, setActiveStatIndex] = useState<number | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Listen for custom trigger from tour guide or quick actions
  useEffect(() => {
    const handleOpenVoice = () => setShowAIAssistant(true);
    window.addEventListener("unicare:open-voice-assistant", handleOpenVoice);

    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "voice-complaint") {
      setShowAIAssistant(true);
    }

    return () => window.removeEventListener("unicare:open-voice-assistant", handleOpenVoice);
  }, []);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = ticketInput.trim();
    if (!clean) {
      toast.info("Please enter a Complaint Number (e.g. PU-2026-1042)");
      return;
    }
    navigate("/track", { state: { complaintNumber: clean } });
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-16">
        {/* Luxury ambient gradient overlay & Balanced Orbs */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B0D]/80 via-transparent to-[#0B1416]/50 pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-[#E0C88B]/12 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-emerald-500/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">

            {/* Live Campus Telemetry Pill */}
            <div className="inline-flex items-center gap-3 glass-panel px-5 py-2 rounded-full mb-8 animate-fade-in border-[#E0C88B]/40 bg-[#E0C88B]/10 shadow-[0_0_25px_rgba(224,200,139,0.2)]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[#F7F2E7] font-bold text-xs tracking-[0.15em] uppercase font-sans">
                Vadodara Campus Dispatch Live
              </span>
              <span className="hidden sm:inline-block text-[#E0C88B]/40">•</span>
              <span className="hidden sm:inline-block text-xs font-sans text-emerald-400 font-bold">
                18m Avg SLA Response
              </span>
            </div>

            {/* Heading with Combo 1 Clash Display + Combo 1/4 Italic Accent */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.12] tracking-tight">
              <span className="text-gradient-royal font-extrabold">Experience Campus</span>
              <br />
              <span className="text-gradient-gold block mt-2 sm:mt-3 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight">
                Pure Excellence
              </span>
            </h1>

            {/* Subtitle with Combo 4 DM Sans / Plus Jakarta warmth */}
            <p className="text-base sm:text-lg md:text-xl font-normal text-slate-200/90 mb-10 leading-relaxed max-w-3xl mx-auto font-sans">
              The next-generation <span className="text-[#E0C88B] font-semibold">campus ecosystem</span> for university facility care with
              <span className="text-[#34D399] font-semibold"> real-time tracking</span>, instant dispatch, and complete accountability.
            </p>

            {/* CTA Action Buttons — now includes AI Voice button */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Button
                data-tour="hero-report-btn"
                size="lg"
                asChild
                className="text-base md:text-lg px-8 py-6 h-auto bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] font-black border-none shadow-[0_0_35px_rgba(224,200,139,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_55px_rgba(224,200,139,0.8)] rounded-2xl"
              >
                <Link to="/register-complaint">
                  Report Issue <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>

              {/* ✨ AI Voice Complaint Assistant Button */}
              <Button
                data-tour="hero-ai-voice-btn"
                size="lg"
                onClick={() => setShowAIAssistant(true)}
                className="text-base md:text-lg px-7 py-6 h-auto bg-gradient-to-r from-emerald-600/90 via-emerald-500/80 to-teal-500/90 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 text-white font-black border border-emerald-400/30 shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(52,211,153,0.6)] rounded-2xl group"
              >
                <Mic className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                AI Voice: Instant File
                <Sparkles className="w-4 h-4 ml-2 text-emerald-200" />
              </Button>

              <Button
                data-tour="hero-track-btn"
                variant="outline"
                size="lg"
                asChild
                className="text-base md:text-lg px-8 py-6 h-auto glass-panel text-[#F7F2E7] hover:bg-white/10 border-white/20 hover:border-[#E0C88B]/60 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_rgba(224,200,139,0.3)] rounded-2xl transition-all duration-300"
              >
                <Link to="/track">Track Status</Link>
              </Button>
            </div>

            {/* Interactive Quick-Track Dock (Direct in Hero!) */}
            <div className="max-w-2xl mx-auto mb-16">
              <form
                onSubmit={handleQuickTrack}
                className="glass-panel-dark p-2 sm:p-2.5 rounded-2xl border border-white/15 dark:border-[#E0C88B]/30 flex flex-col sm:flex-row items-center gap-2 shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(224,200,139,0.15)] focus-within:border-[#E0C88B] transition-all"
              >
                <div className="relative flex-1 w-full flex items-center">
                  <button
                    type="submit"
                    className="absolute left-3.5 text-[#E0C88B] hover:scale-110 transition-transform cursor-pointer p-1"
                    title="Track Complaint"
                    aria-label="Track Complaint"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <Input
                    type="text"
                    placeholder="Fast Track Ticket # (e.g. PU-2026-1042)..."
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    className="bg-transparent border-none text-foreground pl-12 h-12 text-sm sm:text-base focus-visible:ring-0 placeholder:text-slate-400 font-sans font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#E0C88B] hover:bg-[#F3E5AB] text-[#060F10] font-black font-sans shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2 cursor-pointer"
                >
                  <span>Instant Track</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {/* Quick-Click Sample Ticket Pills */}
              <div className="flex items-center justify-center flex-wrap gap-2 mt-3 text-xs text-slate-300 font-sans">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Try demo:</span>
                {sampleTickets.map((demo) => (
                  <button
                    key={demo}
                    type="button"
                    onClick={() => setTicketInput(demo)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#E0C88B]/20 text-slate-200 hover:text-[#E0C88B] transition-all border border-white/15 hover:border-[#E0C88B]/40 font-mono text-xs font-semibold shadow-sm"
                  >
                    {demo}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Stats Grid with Click-To-Inspect */}
            <div data-tour="hero-stats" className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {statsConfig.map((stat, i) => {
                const isSelected = activeStatIndex === i;

                return (
                  <InteractiveTiltCard
                    key={i}
                    maxTilt={12}
                    scaleOnHover={1.04}
                    className="rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.8)] transition-all cursor-pointer"
                  >
                    <div
                      onClick={() => setActiveStatIndex(isSelected ? null : i)}
                      className={`glass-panel p-6 sm:p-7 rounded-3xl h-full flex flex-col items-center justify-center text-center transition-all duration-300 backdrop-blur-2xl border ${
                        isSelected
                          ? "border-[#E0C88B] bg-white/[0.08] shadow-[0_0_30px_rgba(224,200,139,0.3)]"
                          : "border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                      } group`}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-all duration-300 border ${stat.border} ${stat.shadow}`}>
                        <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300" style={{ color: stat.color }} />
                      </div>
                      <div className="text-3xl sm:text-5xl font-black text-white mb-1.5 tracking-tight group-hover:text-gradient-gold transition-all">
                        {stat.value}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-300 font-bold tracking-widest uppercase">
                        {stat.label}
                      </div>

                      {/* Interactive Expandable Insight */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/10 text-xs text-[#E0C88B] font-sans"
                        >
                          {stat.detail}
                        </motion.div>
                      )}
                    </div>
                  </InteractiveTiltCard>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ✨ Floating AI Voice Assistant Button (site-wide dock) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAIAssistant(true)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_30px_rgba(52,211,153,0.4)] flex items-center justify-center group transition-all hover:shadow-[0_0_50px_rgba(52,211,153,0.6)]"
        title="AI Voice: Instant File Complaint"
      >
        <Mic className="w-6 h-6 group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E0C88B] opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#E0C88B] text-[7px] font-bold text-[#060F10] items-center justify-center">AI</span>
        </span>
        {/* Tooltip */}
        <div className="absolute right-[120%] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
          ✨ AI Voice: Instant File
        </div>
      </motion.button>

      {/* AI Voice Complaint Assistant Modal */}
      <VoiceComplaintAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </>
  );
};

export default HeroSection;

