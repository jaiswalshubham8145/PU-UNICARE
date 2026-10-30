import {
  Zap,
  FileText,
  Wand2,
  Layers,
  QrCode,
  Search,
  Brain,
  MessageSquare,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Crown,
  Wrench,
  ShieldCheck,
  Package,
  CalendarDays,
  Contact,
  Map,
  BookOpen,
  HelpCircle,
  Mail,
  FileCode2,
  Star,
  Globe,
  Moon,
  Download,
  Mic,
  Bot,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ─── Tour Step Definitions ───────────────────────────────────────────────────

export interface TourStep {
  id: number;
  target?: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  badge?: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  icon: LucideIcon;
  accentColor: string;
  links?: { label: string; path: string }[];
}

export const tourSteps: TourStep[] = [
  {
    id: 1,
    target: '[data-tour="navbar-brand"]',
    placement: "bottom",
    badge: "Official University Portal",
    title: "Welcome to PU UNICARE",
    subtitle: "Centralized Campus Infrastructure Platform",
    description:
      "PU UNICARE is Parul University's centralized digital infrastructure hub — connecting 250+ acres, 100+ academic blocks, and thousands of students, faculty, and maintenance staff into one real-time accountability network.",
    highlights: [
      "Report any campus issue in under 30 seconds",
      "Real-time ticket progression with live updates",
      "AI-powered automatic fault classification",
      "Mandatory two-way verification before closure",
    ],
    icon: Zap,
    accentColor: "from-emerald-500 to-teal-600",
  },
  {
    id: 2,
    target: '[data-tour="nav-cta-report"]',
    placement: "bottom",
    badge: "Instant Reporting",
    title: "Fast Complaint Intake",
    subtitle: "Submit Maintenance Requests in Seconds",
    description:
      "Click here anytime to report classroom, laboratory, or campus damage. Upload photos, pick your department & room, specify urgency, and let our system automatically dispatch the right specialized technician.",
    highlights: [
      "Instant 1-page quick filing on mobile or desktop",
      "Interactive Step-by-Step Diagnostic Wizard",
      "Bulk batch submission for multiple room issues",
      "QR Code door-tag scanning for auto-room fill",
    ],
    icon: FileText,
    accentColor: "from-amber-500 to-orange-600",
    links: [
      { label: "Report an Issue", path: "/register-complaint" },
      { label: "Guided Wizard", path: "/complaint-wizard" },
    ],
  },
  {
    id: 3,
    target: '[data-tour="hero-ai-voice-btn"]',
    placement: "bottom",
    badge: "Speech Recognition AI",
    title: "AI Voice: Instant Complaint Auto-Filing",
    subtitle: "Hands-Free Voice-to-Ticket in Seconds",
    description:
      "Speak naturally in English, Hindi (हिन्दी), or Gujarati (ગુજરાતી) — including mixed Hinglish and Gujlish. Our real-time speech processor and Gemini AI automatically extract the department, building (A1 PIET, Kalam Bhawan, Central Food Court, etc.), room number, fault category, and priority into a ready-to-file complaint ticket with zero manual typing.",
    highlights: [
      "Multilingual ASR: English, Hindi, Gujarati & mixed dialects auto-detected",
      "Auto-maps speech to 50+ official Parul University blocks, food courts & hostels",
      "Real-time fault classification (Plumbing, Electrical, HVAC, IT, Civil, Carpentry)",
      "Live ticket dossier preview card with 1-tap confirmation and photo attachment",
    ],
    icon: Mic,
    accentColor: "from-emerald-500 to-teal-600",
    links: [
      { label: "Try AI Voice: Instant File", path: "#voice-complaint" },
      { label: "Report Issue Page", path: "/register-complaint" },
    ],
  },
  {
    id: 4,
    target: '[data-tour="ai-chatbot-widget"]',
    placement: "left",
    badge: "Conversational AI",
    title: "UNICARE AI Chatbot",
    subtitle: "24/7 Smart Campus Assistant & Ticket Guide",
    description:
      "Meet UNICARE Assistant — Parul University's intelligent conversational agent powered by Gemini AI. Floating at the bottom-right corner 24/7 to answer facility questions, navigate to campus buildings & food courts, explain maintenance SLAs, or check real-time ticket progress.",
    highlights: [
      "24/7 instant answers powered by Google Gemini AI & campus knowledge base",
      "Query personal ticket progress, technician assignments & SLA countdowns",
      "Interactive directions for academic blocks (A1–A26), hostels & food courts",
      "Available anywhere across the site for both authenticated users & guests",
    ],
    icon: Bot,
    accentColor: "from-amber-500 to-yellow-600",
    links: [
      { label: "Chat with UNICARE AI", path: "#ai-chat" },
      { label: "Browse Knowledge Base", path: "/help" },
    ],
  },
  {
    id: 5,
    target: '[data-tour="hero-track-btn"]',
    placement: "top",
    badge: "Live Transparency",
    title: "Public Real-Time Ticket Tracker",
    subtitle: "Track Any Issue with Zero Login Required",
    description:
      "Students, faculty, and visitors can track any maintenance request simply by entering a ticket tracking ID or phone number. See live step-by-step progress, assigned technician info, and completion proof photos.",
    highlights: [
      "5-Stage visual progress timeline: Pending ➔ Assigned ➔ In Progress ➔ Resolved ➔ Verified",
      "Direct technician name, specialty & contact details",
      "Automated 2hr acknowledge & 24hr resolve SLA countdowns",
      "Inspection photos uploaded by the field crew",
    ],
    icon: Search,
    accentColor: "from-cyan-500 to-blue-600",
    links: [{ label: "Track a Ticket Now", path: "/track" }],
  },
  {
    id: 6,
    target: '[data-tour="theme-toggle"]',
    placement: "bottom",
    badge: "Design & Appearance",
    title: "Radiant Dark & Light Themes",
    subtitle: "Emerald Regal Dark Mode & Academic Parchment",
    description:
      "Switch instantly between our high-contrast Academic Parchment light mode and Parul University's custom Emerald Regal dark mode with custom ambient green glow cards and luminous halos.",
    highlights: [
      "Custom Emerald green radiant ambient glow (#34D399)",
      "High-contrast Academic Parchment light mode",
      "Custom glassmorphism navbar and blurred backdrop cards",
      "Fluid responsive layout for smartphones, tablets, and desktops",
    ],
    icon: Moon,
    accentColor: "from-teal-500 to-emerald-600",
  },
  {
    id: 7,
    target: '[data-tour="lang-switcher"]',
    placement: "bottom",
    badge: "Multilingual Engine",
    title: "Trilingual Localization",
    subtitle: "English • हिन्दी • ગુજરાતી",
    description:
      "PU UNICARE supports three official university languages. Switch anytime with a single click — all navigation, complaint forms, status badges, and dashboards adapt instantly.",
    highlights: [
      "English (Global & Academic standard)",
      "Hindi (हिंदी — National language)",
      "Gujarati (ગુજરાતી — Regional official language)",
      "Dynamic reactive updates with zero page reloads",
    ],
    icon: Globe,
    accentColor: "from-blue-500 to-indigo-600",
  },
  {
    id: 8,
    target: '[data-tour="hero-stats"]',
    placement: "top",
    badge: "Performance & SLAs",
    title: "Guaranteed SLA Benchmarks",
    subtitle: "24-Hour Acknowledgment & 98% Resolution",
    description:
      "Automated Service Level Agreements ensure rapid campus upkeep. Every ticket has strict response deadlines, with automated tier-1 (HOD) and tier-2 (Principal) escalations for overdue work orders.",
    highlights: [
      "24-Hour maximum acknowledgment guarantee",
      "98% first-time resolution success rate",
      "Instant multi-channel SMS & email notifications",
      "100% cryptographic database audit logging",
    ],
    icon: ShieldCheck,
    accentColor: "from-emerald-500 to-green-600",
  },
  {
    id: 9,
    target: '[data-tour="maintenance-categories"]',
    placement: "top",
    badge: "Campus Coverage",
    title: "7 Specialized Infrastructure Domains",
    subtitle: "From Classrooms to Central Laboratories",
    description:
      "Explore the 7 core maintenance modules covering every university asset — each backed by specialized technicians, spare parts inventory, and preventive inspection schedules.",
    highlights: [
      "🌀 Air Conditioning & HVAC Systems",
      "💡 Electrical Infrastructure & Power Backup",
      "🚰 Plumbing, Sanitation & Water Coolers",
      "🪑 Classroom Furniture, Benches & Carpentry",
      "💻 IT Hardware, Smartboards & Wi-Fi Networks",
      "🏗️ Civil Masonry, Glass Windows & Roofing",
      "🧹 Campus Sanitation & Waste Management",
    ],
    icon: Layers,
    accentColor: "from-amber-500 to-yellow-600",
    links: [{ label: "Explore Maintenance Categories", path: "/maintenance" }],
  },
  {
    id: 10,
    target: '[data-tour="roles-section"]',
    placement: "top",
    badge: "Role-Based Security",
    title: "5 Dedicated Role Operating Consoles",
    subtitle: "Tailored Workspaces for Every University Level",
    description:
      "From faculty members and Heads of Department to Principals and field technicians — each user tier has a purpose-built workspace with strictly governed permissions.",
    highlights: [
      "👨‍🏫 Faculty Console — File tickets, verify repairs & give 5-star ratings",
      "📋 HOD Deck — Approve requests & monitor department SLAs",
      "👑 Principal Command — Campus-wide heatmaps & audit metrics",
      "🔧 Technician Field Deck — Mobile work cards & proof uploads",
      "⚙️ Admin Control Center — User role & infrastructure settings",
    ],
    icon: LayoutDashboard,
    accentColor: "from-violet-500 to-purple-600",
    links: [{ label: "Access University Login", path: "/login" }],
  },
];

// ─── All-Pages Directory Definitions ─────────────────────────────────────────

export type PageCategory =
  | "public"
  | "reporting"
  | "dashboards"
  | "facilities"
  | "system";

export interface SitePage {
  name: string;
  path: string;
  description: string;
  icon: LucideIcon;
  category: PageCategory;
  requiresAuth: boolean;
  roles?: string[];
}

export const pageCategoryLabels: Record<PageCategory, { label: string; emoji: string }> = {
  public: { label: "Public Portals", emoji: "🌐" },
  reporting: { label: "Intake & Reporting Tools", emoji: "📝" },
  dashboards: { label: "Role Dashboards", emoji: "📊" },
  facilities: { label: "Campus Facilities", emoji: "🛠️" },
  system: { label: "System & Settings", emoji: "⚙️" },
};

export const sitePages: SitePage[] = [
  // ── Public Portals ──
  {
    name: "Home",
    path: "/",
    description: "Landing page with campus stats, feature highlights, and quick actions.",
    icon: Globe,
    category: "public",
    requiresAuth: false,
  },
  {
    name: "About",
    path: "/about",
    description: "Learn about PU UNICARE's mission and the university maintenance cell.",
    icon: BookOpen,
    category: "public",
    requiresAuth: false,
  },
  {
    name: "Maintenance Categories",
    path: "/maintenance",
    description: "Browse the 7 campus maintenance domains with HD imagery and scope checklists.",
    icon: Layers,
    category: "public",
    requiresAuth: false,
  },
  {
    name: "Contact & Emergency",
    path: "/contact",
    description: "Emergency phone numbers, campus addresses, and direct inquiry form.",
    icon: Mail,
    category: "public",
    requiresAuth: false,
  },
  {
    name: "Knowledge Base",
    path: "/help",
    description: "Searchable self-help guides, troubleshooting tips, and FAQs.",
    icon: BookOpen,
    category: "public",
    requiresAuth: false,
  },
  {
    name: "Help Center",
    path: "/help-center",
    description: "Detailed how-to guides and standard operating procedures.",
    icon: HelpCircle,
    category: "public",
    requiresAuth: false,
  },
  {
    name: "API Documentation",
    path: "/api-docs",
    description: "Interactive REST API endpoint reference for developers.",
    icon: FileCode2,
    category: "public",
    requiresAuth: false,
  },
  {
    name: "Staff Directory",
    path: "/staff-directory",
    description: "Technician roster with live availability status and contact links.",
    icon: Contact,
    category: "public",
    requiresAuth: false,
  },

  // ── Reporting Tools ──
  {
    name: "AI Voice Instant Filing",
    path: "/?action=voice-complaint",
    description: "Hands-free voice recognition complaint filing in English, Hindi, and Gujarati with auto-detection.",
    icon: Mic,
    category: "reporting",
    requiresAuth: false,
  },
  {
    name: "Quick Report",
    path: "/register-complaint",
    description: "Fast single-page complaint submission with photo upload and priority selection.",
    icon: FileText,
    category: "reporting",
    requiresAuth: false,
  },
  {
    name: "Guided Wizard",
    path: "/complaint-wizard",
    description: "Multi-step interactive flow with failure diagnosis questions and AI suggestions.",
    icon: Wand2,
    category: "reporting",
    requiresAuth: false,
  },
  {
    name: "Batch Filing",
    path: "/register-batch",
    description: "Submit multiple classroom issues in a single synchronized transaction.",
    icon: Layers,
    category: "reporting",
    requiresAuth: true,
    roles: ["faculty", "admin"],
  },
  {
    name: "Track Complaint",
    path: "/track",
    description: "Search by ticket ID or phone number and view the live step progression timeline.",
    icon: Search,
    category: "reporting",
    requiresAuth: true,
  },
  {
    name: "Satisfaction Survey",
    path: "/survey",
    description: "Rate completed repairs with 5-star scoring, or reject and re-open tickets.",
    icon: Star,
    category: "reporting",
    requiresAuth: true,
  },

  // ── Role Dashboards ──
  {
    name: "Faculty Dashboard",
    path: "/dashboard/faculty",
    description: "Track personal tickets, verify completed repairs, and submit ratings.",
    icon: Users,
    category: "dashboards",
    requiresAuth: true,
    roles: ["faculty"],
  },
  {
    name: "HOD Dashboard",
    path: "/dashboard/hod",
    description: "Departmental oversight hub — approve, reassign, and monitor SLA compliance.",
    icon: ClipboardCheck,
    category: "dashboards",
    requiresAuth: true,
    roles: ["hod"],
  },
  {
    name: "Principal Dashboard",
    path: "/dashboard/principal",
    description: "Campus-wide executive KPIs, delayed ticket escalations, and audit exports.",
    icon: Crown,
    category: "dashboards",
    requiresAuth: true,
    roles: ["principal"],
  },
  {
    name: "Technician Dashboard",
    path: "/dashboard/maintenance",
    description: "Mobile-first work order cards, status toggles, and completion proof uploads.",
    icon: Wrench,
    category: "dashboards",
    requiresAuth: true,
    roles: ["maintenance_staff"],
  },
  {
    name: "Admin Dashboard",
    path: "/dashboard/admin",
    description: "System administration — users, roles, departments, rooms, and audit logs.",
    icon: ShieldCheck,
    category: "dashboards",
    requiresAuth: true,
    roles: ["admin"],
  },

  // ── Campus Facilities ──
  {
    name: "Inventory Manager",
    path: "/dashboard/inventory",
    description: "Real-time spare parts tracking with low-stock alerts and consumption logging.",
    icon: Package,
    category: "facilities",
    requiresAuth: true,
    roles: ["admin", "maintenance_staff", "hod", "principal"],
  },
  {
    name: "Maintenance Calendar",
    path: "/dashboard/calendar",
    description: "Monthly/weekly view of scheduled preventive maintenance and technician shifts.",
    icon: CalendarDays,
    category: "facilities",
    requiresAuth: true,
    roles: ["admin", "maintenance_staff", "hod", "faculty"],
  },

  // ── System & Settings ──
  {
    name: "UNICARE AI Chatbot",
    path: "#ai-chat",
    description: "24/7 conversational assistant for ticket tracking, campus navigation, and facility troubleshooting.",
    icon: Bot,
    category: "system",
    requiresAuth: false,
  },
  {
    name: "Notifications",
    path: "/notifications",
    description: "Real-time notification inbox with priority filters and quick actions.",
    icon: MessageSquare,
    category: "system",
    requiresAuth: true,
  },
  {
    name: "Multilingual Engine",
    path: "#i18n",
    description: "Switch between English, Hindi (हिंदी), and Gujarati (ગુજરાતી) instantly.",
    icon: Globe,
    category: "system",
    requiresAuth: false,
  },
  {
    name: "Dark / Light Theme",
    path: "#theme",
    description: "Toggle between Radiant Emerald dark mode and Academic Parchment light mode.",
    icon: Moon,
    category: "system",
    requiresAuth: false,
  },
  {
    name: "PDF & Excel Exports",
    path: "#exports",
    description: "Generate compliance reports (PDF) and download raw data (Excel/CSV) for audits.",
    icon: Download,
    category: "system",
    requiresAuth: true,
  },
];
