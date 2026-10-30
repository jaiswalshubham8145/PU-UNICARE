import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  FileText,
  Wand2,
  Moon,
  Sun,
  Globe,
  MapPin,
  LayoutDashboard,
  Package,
  Calendar,
  Contact,
  ShieldAlert,
  ArrowRight,
  Wrench,
  X,
  Layers,
  Download,
  Mic,
  Bot,
  Utensils,
  BookOpen,
  CornerDownLeft,
  HelpCircle,
} from "lucide-react";
import { useTourContext } from "@/components/tour/SiteTourContext";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/hooks/useI18n";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export type CommandCategory = "All" | "Actions" | "AI Features" | "Navigation" | "Campus Hotspots" | "Categories";

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Actions" | "AI Features" | "Navigation" | "Campus Hotspots" | "Categories";
  icon: any;
  shortcut?: string;
  action: () => void;
}

const CATEGORY_TABS: { id: CommandCategory; label: string; icon?: string }[] = [
  { id: "All", label: "All" },
  { id: "AI Features", label: "AI Tools" },
  { id: "Actions", label: "Actions" },
  { id: "Campus Hotspots", label: "Hotspots" },
  { id: "Navigation", label: "Navigation" },
  { id: "Categories", label: "Domains" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CommandCategory>("All");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const { openTour } = useTourContext();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setLanguage } = useI18n();
  const { promptInstall, isInstalled } = usePWAInstall();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isKeyNavRef = useRef(false);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  // Listen to custom toggle events from Navbar, mobile menu, and other triggers
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("unicare:toggle-palette", handleToggle);
    window.addEventListener("unicare:open-palette", handleOpen);
    window.addEventListener("unicare:close-palette", handleClose);

    return () => {
      window.removeEventListener("unicare:toggle-palette", handleToggle);
      window.removeEventListener("unicare:open-palette", handleOpen);
      window.removeEventListener("unicare:close-palette", handleClose);
    };
  }, []);

  // Lock body scroll when Command Palette is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Global keyboard shortcut listener: Cmd/Ctrl + K or pressing "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (
        e.key === "/" &&
        !isOpen &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (document.activeElement?.tagName || "")
        )
      ) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Reset query, category and index on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveCategory("All");
      setSelectedIndex(0);
      isKeyNavRef.current = false;
    }
  }, [isOpen]);

  const runAction = useCallback((fn: () => void) => {
    setIsOpen(false);
    fn();
  }, []);

  const baseCommands: CommandItem[] = useMemo(
    () => [
      // AI Features
      {
        id: "ai-voice-file",
        title: "AI Voice Instant Complaint",
        subtitle: "Speak in Hindi, Gujarati, English, or mix to file issues automatically",
        category: "AI Features",
        icon: Mic,
        shortcut: "V",
        action: () => {
          navigate("/?action=voice-complaint");
          window.dispatchEvent(new CustomEvent("unicare:open-voice-complaint"));
        },
      },
      {
        id: "ai-chatbot",
        title: "Ask UNICARE AI Chatbot",
        subtitle: "Campus assistant for maintenance guidelines, building directory & status",
        category: "AI Features",
        icon: Bot,
        shortcut: "C",
        action: () => {
          window.dispatchEvent(new CustomEvent("unicare:open-ai-chat"));
        },
      },

      // Quick Actions
      {
        id: "act-report",
        title: "Report an Issue",
        subtitle: "Submit classroom, lab, or campus facility maintenance request",
        category: "Actions",
        icon: FileText,
        shortcut: "R",
        action: () => navigate("/register-complaint"),
      },
      {
        id: "act-wizard",
        title: "Interactive Complaint Wizard",
        subtitle: "Step-by-step diagnostic failure questionnaire",
        category: "Actions",
        icon: Wand2,
        shortcut: "W",
        action: () => navigate("/complaint-wizard"),
      },
      {
        id: "act-track",
        title: "Track Issue Status",
        subtitle: "Live resolution timeline by Ticket ID or phone",
        category: "Actions",
        icon: Search,
        shortcut: "T",
        action: () => navigate("/track"),
      },
      {
        id: "act-tour",
        title: "Launch On-Screen Site Tour",
        subtitle: "Interactive guided walkthrough of the platform",
        category: "Actions",
        icon: Sparkles,
        shortcut: "S",
        action: () => openTour(),
      },
      ...(!isInstalled
        ? [
            {
              id: "act-install-pwa",
              title: "Install PU UNICARE App (PWA)",
              subtitle: "Install progressive web app for offline use and push alerts",
              category: "Actions" as const,
              icon: Download,
              shortcut: "P",
              action: () => promptInstall(),
            },
          ]
        : []),
      {
        id: "act-theme",
        title: `Toggle Theme (${resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"})`,
        subtitle: "Switch between Emerald Regal and Academic Parchment",
        category: "Actions",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        shortcut: "M",
        action: () => toggleTheme(),
      },
      {
        id: "act-lang-hi",
        title: "Switch Language to Hindi (हिंदी)",
        subtitle: "Change portal localization to Hindi",
        category: "Actions",
        icon: Globe,
        action: () => setLanguage("hi"),
      },
      {
        id: "act-lang-gu",
        title: "Switch Language to Gujarati (ગુજરાતી)",
        subtitle: "Change portal localization to Gujarati",
        category: "Actions",
        icon: Globe,
        action: () => setLanguage("gu"),
      },
      {
        id: "act-lang-en",
        title: "Switch Language to English",
        subtitle: "Standard English interface",
        category: "Actions",
        icon: Globe,
        action: () => setLanguage("en"),
      },

      // Navigation
      {
        id: "nav-faculty",
        title: "Faculty Dashboard",
        subtitle: "Personal tickets, verification queue, and ratings",
        category: "Navigation",
        icon: LayoutDashboard,
        action: () => navigate("/dashboard/faculty"),
      },
      {
        id: "nav-hod",
        title: "HOD Operations Deck",
        subtitle: "Department tickets, SLA monitoring, and manual dispatch",
        category: "Navigation",
        icon: LayoutDashboard,
        action: () => navigate("/dashboard/hod"),
      },
      {
        id: "nav-principal",
        title: "Principal Command Center",
        subtitle: "University-wide KPIs, delayed tickets, and compliance reports",
        category: "Navigation",
        icon: LayoutDashboard,
        action: () => navigate("/dashboard/principal"),
      },
      {
        id: "nav-staff",
        title: "Technician Field Deck",
        subtitle: "Work orders, status progression, and proof-of-work uploads",
        category: "Navigation",
        icon: Wrench,
        action: () => navigate("/dashboard/maintenance"),
      },
      {
        id: "nav-inventory",
        title: "Spare Parts Inventory",
        subtitle: "Real-time stock counts, alerts, and consumption log",
        category: "Navigation",
        icon: Package,
        action: () => navigate("/dashboard/inventory"),
      },
      {
        id: "nav-calendar",
        title: "Maintenance Calendar",
        subtitle: "Scheduled preventive maintenance & shutdown events",
        category: "Navigation",
        icon: Calendar,
        action: () => navigate("/dashboard/calendar"),
      },
      {
        id: "nav-directory",
        title: "Staff & Technician Directory",
        subtitle: "On-duty status, specialties, and contact details",
        category: "Navigation",
        icon: Contact,
        action: () => navigate("/staff-directory"),
      },
      {
        id: "nav-help",
        title: "Help Center & FAQs",
        subtitle: "Troubleshooting answers, escalation matrix, and guides",
        category: "Navigation",
        icon: HelpCircle,
        action: () => navigate("/help"),
      },
      {
        id: "nav-contact",
        title: "Emergency Campus Contact",
        subtitle: "Control room hotlines for electrical, water, or IT emergencies",
        category: "Navigation",
        icon: ShieldAlert,
        action: () => navigate("/contact"),
      },

      // Campus Hotspots & Academic Buildings
      {
        id: "hot-piet",
        title: "A1 - Parul Institute of Engineering & Technology (PIET)",
        subtitle: "CSE, IT, Mechanical, Electrical labs & core departments",
        category: "Campus Hotspots",
        icon: MapPin,
        action: () => navigate("/register-complaint?building=A1%20-%20Parul%20Institute%20of%20Engineering%20%26%20Technology%20(PIET)"),
      },
      {
        id: "hot-pit",
        title: "A4 - Parul Institute of Technology (PIT)",
        subtitle: "Robotics, AI/ML center, civil & electronics workshops",
        category: "Campus Hotspots",
        icon: MapPin,
        action: () => navigate("/register-complaint?building=A4%20-%20Parul%20Institute%20of%20Technology%20(PIT)"),
      },
      {
        id: "hot-med",
        title: "E1 - Parul Sevashram Hospital & Medical College",
        subtitle: "Clinical labs, OPD corridors, wards, and emergency care",
        category: "Campus Hotspots",
        icon: MapPin,
        action: () => navigate("/register-complaint?building=E1%20-%20Parul%20Sevashram%20Hospital"),
      },
      {
        id: "hot-lib",
        title: "C3 - Central University Library",
        subtitle: "Reading halls, digital reference wing & study cubicles",
        category: "Campus Hotspots",
        icon: BookOpen,
        action: () => navigate("/register-complaint?building=C3%20-%20Central%20University%20Library"),
      },
      {
        id: "hot-food-main",
        title: "F1 - Main Campus Food Court & Plaza",
        subtitle: "Multi-cuisine dining, Nescafe, juice counter & seating atrium",
        category: "Campus Hotspots",
        icon: Utensils,
        action: () => navigate("/register-complaint?building=F1%20-%20Main%20Campus%20Food%20Court"),
      },
      {
        id: "hot-food-mba",
        title: "F2 - Management Food Court (MBA Canteen)",
        subtitle: "Express cafe, snack point & beverage corner",
        category: "Campus Hotspots",
        icon: Utensils,
        action: () => navigate("/register-complaint?building=F2%20-%20Management%20Food%20Court"),
      },
      {
        id: "hot-kalam",
        title: "H1 - Dr. A.P.J. Abdul Kalam Bhawan (Boys Hostel)",
        subtitle: "Rooms, solar geysers, Wi-Fi router points & study lounge",
        category: "Campus Hotspots",
        icon: MapPin,
        action: () => navigate("/register-complaint?building=H1%20-%20Dr.%20A.P.J.%20Abdul%20Kalam%20Bhawan"),
      },
      {
        id: "hot-kalpana",
        title: "H2 - Kalpana Chawla Bhawan (Girls Hostel)",
        subtitle: "Hostel rooms, water purifiers, washrooms & balcony lighting",
        category: "Campus Hotspots",
        icon: MapPin,
        action: () => navigate("/register-complaint?building=H2%20-%20Kalpana%20Chawla%20Bhawan"),
      },

      // Categories
      {
        id: "cat-ac",
        title: "Air Conditioning & HVAC Domain",
        subtitle: "Cooling issues, compressor faults, fan speed, dripping",
        category: "Categories",
        icon: Layers,
        action: () => navigate("/maintenance"),
      },
      {
        id: "cat-elec",
        title: "Electrical & Power Systems",
        subtitle: "Tube lights, fans, power sockets, MCB tripping, UPS backup",
        category: "Categories",
        icon: Layers,
        action: () => navigate("/maintenance"),
      },
      {
        id: "cat-plumb",
        title: "Plumbing & Sanitation",
        subtitle: "Water coolers, tap leakage, washroom hygiene, water supply",
        category: "Categories",
        icon: Layers,
        action: () => navigate("/maintenance"),
      },
      {
        id: "cat-it",
        title: "Classroom IT, Projectors & Wi-Fi",
        subtitle: "Smartboards, HDMI cables, audio amplifiers, AP signal",
        category: "Categories",
        icon: Layers,
        action: () => navigate("/maintenance"),
      },
    ],
    [navigate, openTour, theme, resolvedTheme, toggleTheme, setLanguage, isInstalled, promptInstall]
  );

  // Filter commands by search query and category
  const filteredCommands = useMemo(() => {
    const trimmed = query.trim();
    let list = baseCommands;

    if (activeCategory !== "All") {
      list = list.filter((cmd) => cmd.category === activeCategory);
    }

    if (trimmed) {
      const q = trimmed.toLowerCase();
      const matched = list.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(q) ||
          (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
          cmd.category.toLowerCase().includes(q)
      );

      // Dynamic smart options when user types a search term
      const dynamicItems: CommandItem[] = [];

      // 1. If query looks like a ticket number or contains digits
      if (/\d/.test(trimmed) || /pu[-_]?\d+/i.test(trimmed)) {
        dynamicItems.push({
          id: `dyn-track-${trimmed}`,
          title: `Track Ticket: "${trimmed.toUpperCase()}"`,
          subtitle: "Instant lookup in live resolution telemetry",
          category: "Actions",
          icon: Search,
          action: () => navigate("/track", { state: { complaintNumber: trimmed } }),
        });
      }

      // 2. Search maintenance directory for symptom
      dynamicItems.push({
        id: `dyn-maint-${trimmed}`,
        title: `Search Maintenance for: "${trimmed}"`,
        subtitle: "Find technicians, equipment, and related repair SOPs",
        category: "Actions",
        icon: Wrench,
        action: () => navigate("/maintenance"),
      });

      // 3. File a new complaint with this description
      dynamicItems.push({
        id: `dyn-report-${trimmed}`,
        title: `Report issue: "${trimmed}"`,
        subtitle: "Pre-fill new maintenance ticket description",
        category: "Actions",
        icon: FileText,
        action: () => navigate("/register-complaint"),
      });

      return [...dynamicItems, ...matched];
    }

    return list;
  }, [baseCommands, query, activeCategory, navigate]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (filteredCommands.length === 0) return 0;
      if (prev >= filteredCommands.length) return filteredCommands.length - 1;
      return prev;
    });
  }, [filteredCommands.length]);

  // Arrow key navigation
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        isKeyNavRef.current = true;
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        isKeyNavRef.current = true;
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          runAction(filteredCommands[selectedIndex].action);
        }
      }
    };

    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, filteredCommands, selectedIndex, runAction]);

  // Auto-scroll selected item into view smoothly on keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    if (isKeyNavRef.current && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
      isKeyNavRef.current = false;
    }
  }, [selectedIndex, isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="PU UNICARE Quick Navigator"
            className="fixed inset-0 z-[120] flex items-start justify-center pt-12 md:pt-20 px-3 sm:px-4 overflow-hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Command Palette Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-[#071314]/95 text-foreground rounded-3xl border border-emerald-400/40 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(52,211,153,0.3)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
            >
              {/* Search Input Bar */}
              <div className="relative flex items-center px-4 sm:px-5 py-3.5 sm:py-4 border-b border-emerald-500/20 bg-emerald-950/30 gap-2.5">
                <button
                  type="button"
                  onClick={() => inputRef.current?.focus()}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 cursor-pointer"
                  title="Search query"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search commands, buildings, ticket # (PU-2026-...), or issues..."
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
                  autoFocus
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedIndex(0);
                      inputRef.current?.focus();
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    aria-label="Clear query"
                    title="Clear query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors shrink-0"
                  aria-label="Close"
                  title="Close (Esc)"
                >
                  ESC
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-black/20 overflow-x-auto scrollbar-none text-xs">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(tab.id);
                        setSelectedIndex(0);
                      }}
                      className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
                <span className="text-[11px] text-slate-500 ml-auto pl-2 shrink-0 hidden sm:inline">
                  {filteredCommands.length} {filteredCommands.length === 1 ? "result" : "results"}
                </span>
              </div>

              {/* Command List Area with Sleek Custom Scrollbar */}
              <div
                ref={listRef}
                tabIndex={0}
                className="p-2.5 sm:p-3 overflow-y-auto max-h-[50vh] sm:max-h-[55vh] space-y-1.5 overscroll-contain focus:outline-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-emerald-500/30 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-400/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(52, 211, 153, 0.4) transparent",
                }}
              >
                {filteredCommands.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 px-4">
                    <p className="text-sm font-semibold text-slate-200">
                      No matching actions found for "{query}"
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Try searching by keyword or click a quick suggestion:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md mx-auto">
                      {["Voice Complaint", "Chatbot", "Track Ticket", "PIET", "PIT", "Hospital", "AC Repair", "Library"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setQuery(tag);
                            setSelectedIndex(0);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-400/30 transition-all cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  filteredCommands.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const ItemIcon = item.icon;

                    return (
                      <div
                        key={item.id}
                        ref={(el) => {
                          itemRefs.current[idx] = el;
                        }}
                        onClick={() => runAction(item.action)}
                        onMouseMove={() => {
                          if (selectedIndex !== idx) {
                            setSelectedIndex(idx);
                          }
                        }}
                        className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-emerald-500/20 text-white border border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.25)]"
                            : "text-slate-300 hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                                : "bg-white/10 text-emerald-300"
                            }`}
                          >
                            <ItemIcon className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">
                                {item.title}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300 shrink-0">
                                {item.category}
                              </span>
                            </div>
                            {item.subtitle && (
                              <p className="text-xs text-slate-400 truncate mt-0.5 font-normal">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {item.shortcut && (
                            <kbd className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/10 text-emerald-300 border border-emerald-400/30 hidden sm:inline">
                              {item.shortcut}
                            </kbd>
                          )}
                          <ArrowRight
                            className={`w-4 h-4 transition-transform ${
                              isSelected
                                ? "text-emerald-400 translate-x-0.5"
                                : "text-transparent"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Bar */}
              <div className="px-4 sm:px-5 py-3 border-t border-emerald-500/20 bg-emerald-950/40 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-300">
                      ↑↓
                    </kbd>{" "}
                    Scroll
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-300">
                      <CornerDownLeft className="w-2.5 h-2.5 inline" /> Enter
                    </kbd>{" "}
                    Open
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-300">
                      Esc
                    </kbd>{" "}
                    Close
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="truncate">PU UNICARE Quick Navigator</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CommandPalette;
