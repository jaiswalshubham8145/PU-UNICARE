import { useState } from "react";
import {
  Brain, Smartphone, Star, RefreshCcw, FileBarChart, Bell,
  Clock, TrendingUp, Shield, Sparkles, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveTiltCard } from "@/components/ui/InteractiveTiltCard";
import aiCategorizationImg from "@/assets/Ai Based  categorization.jpeg";
import mobileFirstImg from "@/assets/mobile first design.jpeg";
import feedbackImg from "@/assets/feedback and rating.jpeg";
import preventiveImg from "@/assets/preventive maintainance.jpeg";
import reportsImg from "@/assets/report and analytics'.jpeg";
import alertsImg from "@/assets/multi channel alters.jpeg";
import slaImg from "@/assets/SLA management.jpeg";
import performanceImg from "@/assets/Performance Dashboard.jpeg";
import secureImg from "@/assets/Secure & Accountable.jpeg";

interface FeatureItem {
  id: string;
  category: "ai" | "mobile" | "analytics";
  icon: typeof Brain;
  title: string;
  badge: string;
  description: string;
  image: string;
}

const features: FeatureItem[] = [
  {
    id: "ai",
    category: "ai",
    icon: Brain,
    title: "AI-Based Categorization",
    badge: "Automated NLP",
    description: "Automatic issue classification from voice, text, and photos with immediate technician routing.",
    image: aiCategorizationImg,
  },
  {
    id: "mobile",
    category: "mobile",
    icon: Smartphone,
    title: "Mobile-First Design",
    badge: "PWA Enabled",
    description: "One-tap ticket creation with camera capture, voice dictation, and GPS anchoring on any mobile device.",
    image: mobileFirstImg,
  },
  {
    id: "feedback",
    category: "mobile",
    icon: Star,
    title: "Faculty Feedback & Rating",
    badge: "5-Star Loop",
    description: "Instant post-resolution verification where faculty rate quality before tickets are archived.",
    image: feedbackImg,
  },
  {
    id: "preventive",
    category: "analytics",
    icon: RefreshCcw,
    title: "Preventive Maintenance",
    badge: "Smart Schedule",
    description: "Scheduled equipment health inspections and lifecycle servicing preventing unexpected campus blackouts.",
    image: preventiveImg,
  },
  {
    id: "reports",
    category: "analytics",
    icon: FileBarChart,
    title: "Audit Reports & Analytics",
    badge: "1-Click PDF/Excel",
    description: "Automated institutional audit reports, SLA compliance graphs, and equipment cost breakdowns.",
    image: reportsImg,
  },
  {
    id: "alerts",
    category: "mobile",
    icon: Bell,
    title: "Multi-Channel Alerts",
    badge: "WhatsApp & SMS",
    description: "Instant dispatch milestones transmitted directly to faculty and staff via WhatsApp, SMS, and Email.",
    image: alertsImg,
  },
  {
    id: "sla",
    category: "ai",
    icon: Clock,
    title: "Automated SLA Escalation",
    badge: "Zero Delays",
    description: "Strict 24-hour response clock that automatically escalates delayed tickets directly to Campus Deans.",
    image: slaImg,
  },
  {
    id: "performance",
    category: "analytics",
    icon: TrendingUp,
    title: "Real-Time Telemetry Hub",
    badge: "Live Metrics",
    description: "Department-wise infrastructure health matrices, resolution speed leaderboards, and heatmaps.",
    image: performanceImg,
  },
  {
    id: "secure",
    category: "ai",
    icon: Shield,
    title: "Role-Based Accountability",
    badge: "Cryptographic Audit",
    description: "Granular access controls with tamper-proof photo verification uploaded before every work closure.",
    image: secureImg,
  },
];

const featureTabs = [
  { id: "all", label: "All Capabilities" },
  { id: "ai", label: "AI & Dispatch Automation" },
  { id: "mobile", label: "Mobile & Field Tools" },
  { id: "analytics", label: "Analytics & Oversight" },
];

const FeaturesGrid = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredFeatures = features.filter(f => {
    if (activeFilter === "all") return true;
    return f.category === activeFilter;
  });

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Luxury ambient overlay & Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B0D]/50 via-transparent to-[#0B1416]/30 pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-[500px] h-[500px] bg-[#E0C88B]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-emerald-500/12 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-6 py-2.5 glass-panel text-[#E0C88B] rounded-full text-xs font-semibold tracking-[0.25em] uppercase mb-6 shadow-[0_0_20px_rgba(224,200,139,0.25)] border-[#E0C88B]/40 bg-[#E0C88B]/10 font-mono">
            Premium Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight drop-shadow-sm">
            <span className="text-gradient-royal">Smart Additions for</span>{" "}
            <span className="text-gradient-gold italic-sovereign font-normal">Maximum Efficiency</span>
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto text-lg leading-relaxed font-normal font-sans">
            UNICARE defines state-of-the-art facility management. Every tool is crafted for precision, speed, and ease of use.
          </p>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {featureTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] text-[#060F10] shadow-[0_0_20px_rgba(224,200,139,0.4)] scale-105 font-bold"
                      : "glass-panel-dark text-slate-300 hover:text-white border border-white/10 hover:border-[#E0C88B]/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Features Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <InteractiveTiltCard
                  maxTilt={7}
                  glowColor="rgba(224, 200, 139, 0.22)"
                  className="group relative h-80 rounded-3xl overflow-hidden glass-panel border-white/10 hover:border-[#E0C88B]/50 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(224,200,139,0.25)] transition-all duration-500 cursor-pointer"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060B0D] via-[#081214]/85 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#E0C88B] border border-[#E0C88B]/30 font-bold">
                      {feature.badge}
                    </span>
                  </div>

                  <div className="relative p-7 h-full flex flex-col justify-end text-white z-20">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E0C88B]/25 to-[#103B32]/40 backdrop-blur-md flex items-center justify-center mb-3.5 border border-[#E0C88B]/40 group-hover:border-[#E0C88B]/80 transition-all duration-300 shadow-[0_0_20px_rgba(224,200,139,0.25)]">
                      <feature.icon className="w-6 h-6 text-[#E0C88B] drop-shadow-[0_0_6px_rgba(224,200,139,0.6)]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight text-white group-hover:text-gradient-gold transition-colors font-display">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal line-clamp-2 group-hover:text-[#F7F2E7] transition-colors font-sans">
                      {feature.description}
                    </p>
                  </div>
                </InteractiveTiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
