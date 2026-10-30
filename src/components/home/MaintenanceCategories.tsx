import { useState } from "react";
import {
  Lightbulb, Monitor, Wrench, Droplets, Building2, ShieldAlert, Zap,
  School, FlaskConical, Bath, TreePine, Bus, ArrowRight, Clock, ShieldCheck, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CategoryData {
  id: string;
  group: "academic" | "hygiene" | "infrastructure";
  icon: typeof School;
  title: string;
  description: string;
  items: string[];
  image: string;
  color: string;
  sla: string;
  activeStaff: number;
}

const categories: CategoryData[] = [
  {
    id: "classroom",
    group: "academic",
    icon: School,
    title: "Classroom Maintenance",
    description: "Lighting, smart boards, acoustic AV, ergonomic benches, HVAC climate units",
    items: ["Smart boards & AV", "Fans & ventilation", "AC systems", "LED lighting"],
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    color: "from-emerald-600 to-teal-800",
    sla: "< 2 Hours",
    activeStaff: 6,
  },
  {
    id: "department",
    group: "academic",
    icon: Building2,
    title: "Department Maintenance",
    description: "Faculty cabins, conference hubs, printers, high-speed fiber Wi-Fi, furniture",
    items: ["Office equipment", "Printers & scanners", "Internet & Wi-Fi", "Storage units"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    color: "from-teal-600 to-emerald-700",
    sla: "< 4 Hours",
    activeStaff: 4,
  },
  {
    id: "laboratory",
    group: "academic",
    icon: FlaskConical,
    title: "Laboratory Maintenance",
    description: "Precision research instruments, electrical safety, hardware, clean exhaust",
    items: ["Lab instruments", "Safety equipment", "System hardware", "Exhaust hoods"],
    image: "https://images.unsplash.com/photo-1581093577421-f561a654a353?auto=format&fit=crop&w=1200&q=80",
    color: "from-[#1F3F73] to-[#12302F]",
    sla: "< 2 Hours",
    activeStaff: 5,
  },
  {
    id: "washroom",
    group: "hygiene",
    icon: Bath,
    title: "Washroom & Hygiene",
    description: "Pressurized water supply, rapid drainage, sanitation schedules, fixtures",
    items: ["Water supply", "Drainage systems", "Sanitation audits", "Sensor fittings"],
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80",
    color: "from-cyan-600 to-teal-700",
    sla: "< 1 Hour",
    activeStaff: 8,
  },
  {
    id: "infrastructure",
    group: "infrastructure",
    icon: TreePine,
    title: "Campus Infrastructure",
    description: "Paved pathways, parking lots, botanical gardens, high-mast illumination",
    items: ["Roads & pathways", "Parking areas", "Botanical gardens", "Street lighting"],
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    color: "from-green-600 to-emerald-800",
    sla: "< 6 Hours",
    activeStaff: 7,
  },
  {
    id: "safety",
    group: "infrastructure",
    icon: ShieldAlert,
    title: "Safety & Security",
    description: "High-definition CCTV grids, fire suppression, emergency exits, access gates",
    items: ["CCTV network", "Fire suppression", "Emergency exits", "Access gates"],
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
    color: "from-red-600 to-rose-800",
    sla: "< 30 Mins (Urgent)",
    activeStaff: 9,
  },
  {
    id: "utilities",
    group: "infrastructure",
    icon: Zap,
    title: "Utilities & Power Grid",
    description: "Heavy duty passenger lifts, DG power backups, solar grids, PA systems",
    items: ["Smart lifts", "Backup generators", "Solar arrays", "PA systems"],
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    color: "from-amber-500 to-yellow-700",
    sla: "< 1 Hour",
    activeStaff: 6,
  },
];

const filterTabs = [
  { id: "all", label: "All Modules" },
  { id: "academic", label: "Academic & Labs" },
  { id: "hygiene", label: "Hygiene & Sanitization" },
  { id: "infrastructure", label: "Power & Infrastructure" },
];

const MaintenanceCategories = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = categories.filter(c => {
    if (activeTab === "all") return true;
    return c.group === activeTab;
  });

  return (
    <section id="maintenance-categories" data-tour="maintenance-categories" className="py-24 relative overflow-hidden">
      {/* Luxury ambient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060F10]/40 via-transparent to-[#0B1416]/40 pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-[#E0C88B]/08 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-6 py-2.5 glass-panel text-[#E0C88B] rounded-full text-xs font-semibold tracking-[0.2em] uppercase mb-6 shadow-[0_0_20px_rgba(224,200,139,0.25)] border-[#E0C88B]/40 bg-[#E0C88B]/10 font-sans font-bold">
            Maintenance Modules
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span className="text-gradient-royal">Complete Campus</span>{" "}
            <span className="text-gradient-gold font-extrabold">Coverage</span>
          </h2>
          <p className="text-slate-300 font-normal max-w-2xl mx-auto text-base md:text-lg font-sans">
            From smart research labs to electrical infrastructure — UNICARE monitors and services every wing of Parul University.
          </p>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

        {/* Animated Categories Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((category) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="group glass-panel-dark rounded-3xl overflow-hidden border border-white/10 hover:border-[#E0C88B]/50 hover:shadow-[0_16px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(224,200,139,0.2)] transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Header with Overlaid Status */}
                  <div className={`h-44 relative overflow-hidden bg-gradient-to-br ${category.color}`}>
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D0E] via-black/40 to-transparent" />

                    {/* Top SLA & Staff Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-[#E0C88B] font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#E0C88B]" />
                        <span>SLA: {category.sla}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[11px] font-mono text-emerald-300 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{category.activeStaff} Staff On-Call</span>
                      </div>
                    </div>

                    {/* Card Title & Icon */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#E0C88B]/20 backdrop-blur-md flex items-center justify-center border border-[#E0C88B]/40 shadow-[0_0_15px_rgba(224,200,139,0.3)]">
                          <category.icon className="w-5 h-5 text-[#E0C88B]" />
                        </div>
                        <h3 className="text-lg font-bold text-white font-display">{category.title}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Tag Chips */}
                  <div className="p-5">
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed font-sans">{category.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {category.items.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs rounded-lg font-mono"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0 border-t border-white/05 mt-2 flex items-center justify-between">
                  <Link
                    to="/register-complaint"
                    className="text-xs font-bold text-[#E0C88B] hover:text-[#F3E5AB] flex items-center gap-1.5 transition-colors group-hover:translate-x-1 duration-200"
                  >
                    <span>Report in this Category</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/maintenance"
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    View Catalog
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="glass-panel text-slate-200 hover:text-white border-white/20 hover:border-[#E0C88B]/60 rounded-2xl px-8 shadow-xl hover:shadow-[0_0_30px_rgba(224,200,139,0.25)] transition-all"
          >
            <Link to="/maintenance" className="inline-flex items-center gap-2 font-bold font-sans">
              <span>Explore Complete Maintenance Catalog</span>
              <ArrowRight className="w-4 h-4 text-[#E0C88B]" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MaintenanceCategories;
