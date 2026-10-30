import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Sparkles, CheckCircle2, Wrench, ShieldCheck, ArrowRight } from "lucide-react";

interface CampusEvent {
  id: string;
  icon: any;
  category: string;
  location: string;
  action: string;
  time: string;
  badgeColor: string;
}

const recentCampusEvents: CampusEvent[] = [
  {
    id: "evt-1",
    icon: CheckCircle2,
    category: "HVAC",
    location: "PIT Block A • Room 304",
    action: "AC compressor cooling restored by Tech Sunil",
    time: "3m ago",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-400/30",
  },
  {
    id: "evt-2",
    icon: Wrench,
    category: "Plumbing",
    location: "Biochem Lab 2",
    action: "Emergency pressure valve repaired & water cooler sanitized",
    time: "11m ago",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-400/30",
  },
  {
    id: "evt-3",
    icon: CheckCircle2,
    category: "Electrical",
    location: "Architecture Studio",
    action: "12 LED tube panels replaced & verified by Faculty",
    time: "24m ago",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-400/30",
  },
  {
    id: "evt-4",
    icon: Wrench,
    category: "AV/IT",
    location: "Central Auditorium 2",
    action: "HDMI splitter re-routed & 4K display calibrated",
    time: "38m ago",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-400/30",
  },
  {
    id: "evt-5",
    icon: ShieldCheck,
    category: "Quality",
    location: "Mechanical Dept",
    action: "5-Star satisfaction rating signed off by Prof. Desai",
    time: "52m ago",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-400/30",
  },
  {
    id: "evt-6",
    icon: CheckCircle2,
    category: "Carpentry",
    location: "Pharmacy Wing B • Lab 102",
    action: "8 classroom benches repaired with anti-wobble mounts",
    time: "1h ago",
    badgeColor: "text-teal-400 bg-teal-500/10 border-teal-400/30",
  },
];

export function CampusPulseTicker() {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate events for seamless endless CSS marquee loop
  const duplicatedEvents = [...recentCampusEvents, ...recentCampusEvents];

  return (
    <div className="relative z-20 w-full overflow-hidden border-y border-emerald-400/20 bg-[#061113]/80 backdrop-blur-xl py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(52,211,153,0.15)]">
      <div className="flex items-center">
        {/* Left Live Badge */}
        <div className="shrink-0 flex items-center gap-2 pl-4 pr-5 border-r border-emerald-500/25 bg-[#061113] z-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Campus Pulse</span>
          </div>
        </div>

        {/* Scrolling Event Ticker */}
        <div
          className="flex-1 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`flex items-center gap-6 whitespace-nowrap ${
              isPaused ? "" : "animate-marquee"
            }`}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {duplicatedEvents.map((evt, idx) => {
              const EventIcon = evt.icon;

              return (
                <div
                  key={`${evt.id}-${idx}`}
                  className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 transition-colors cursor-pointer text-xs group"
                >
                  <span
                    className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider border ${evt.badgeColor}`}
                  >
                    {evt.category}
                  </span>
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    {evt.location}:
                  </span>
                  <span className="text-slate-300 font-medium">
                    {evt.action}
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">
                    • {evt.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right CTA Link */}
        <div className="shrink-0 pl-4 pr-6 border-l border-emerald-500/25 bg-[#061113] z-10 hidden sm:flex items-center">
          <Link
            to="/track"
            className="flex items-center gap-1 text-xs font-bold text-[#E0C88B] hover:text-white transition-colors"
          >
            <span>Live Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CampusPulseTicker;
