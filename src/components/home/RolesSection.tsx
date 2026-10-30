import { useState } from "react";
import {
  User,
  UserCog,
  Users,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Sliders,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface RoleDetail {
  id: string;
  tabLabel: string;
  icon: typeof User;
  title: string;
  level: string;
  badge: string;
  color: string;
  glow: string;
  borderActive: string;
  summary: string;
  permissions: string[];
  restrictions: string[];
  simulatedPreview: {
    header: string;
    sub: string;
    mockStat1: { label: string; val: string };
    mockStat2: { label: string; val: string };
    mockAction: string;
    mockActionColor: string;
  };
}

const rolesData: RoleDetail[] = [
  {
    id: "faculty",
    tabLabel: "Class Faculty",
    icon: User,
    title: "Class & Lab Faculty",
    level: "Originating Authority",
    badge: "Reporting Tier",
    color: "from-blue-500 to-indigo-600",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    borderActive: "border-blue-400",
    summary: "Faculty members register maintenance issues directly from lecture halls or research labs with photo evidence, voice dictation, and GPS anchoring.",
    permissions: [
      "Submit tickets with photo/video evidence & GPS tag",
      "Real-time tracking of assigned staff and progress",
      "Verify work completion & upload quality remarks",
      "Submit 5-star satisfaction feedback ratings",
      "Receive WhatsApp & email status updates",
    ],
    restrictions: [
      "Cannot assign internal maintenance workers",
      "Cannot override SLA resolution deadlines",
    ],
    simulatedPreview: {
      header: "Faculty Console • Computer Engineering Lab 402",
      sub: "Ticket #PU-8821: AC Unit Water Leakage reported at 10:14 AM",
      mockStat1: { label: "Assigned Staff", val: "R. Sharma (Senior HVAC)" },
      mockStat2: { label: "Estimated Finish", val: "Today 12:30 PM" },
      mockAction: "Verify Completion & Rate 5-Stars ★",
      mockActionColor: "bg-emerald-500 text-black hover:bg-emerald-400",
    },
  },
  {
    id: "hod",
    tabLabel: "HOD (Approver)",
    icon: UserCog,
    title: "Head of Department (HOD)",
    level: "Approval & Assignment Authority",
    badge: "Approval Tier",
    color: "from-[#C2A05A] via-[#E0C88B] to-[#C2A05A]",
    glow: "shadow-[0_0_30px_rgba(224,200,139,0.35)]",
    borderActive: "border-[#E0C88B]",
    summary: "HODs oversee all complaints from their department, approve or re-route them within 24 hours, assign specific technicians, and set target timelines.",
    permissions: [
      "Automated triage inbox for all departmental tickets",
      "1-Click Approve, Reject, or Request Clarification",
      "Assign qualified technicians based on workload",
      "Define custom resolution deadlines & priority escalations",
      "View department-wide maintenance budget & trends",
    ],
    restrictions: [
      "Cannot modify complaints of other university faculties",
    ],
    simulatedPreview: {
      header: "HOD Dispatch Hub • Civil Engineering Wing",
      sub: "3 Pending Approval Tickets requiring staff assignment",
      mockStat1: { label: "Approval Queue", val: "3 Tickets Waiting" },
      mockStat2: { label: "Staff Available", val: "8 Technicians On-Duty" },
      mockAction: "Approve & Dispatch Technician",
      mockActionColor: "bg-[#E0C88B] text-black hover:bg-[#F3E5AB]",
    },
  },
  {
    id: "principal",
    tabLabel: "Principal & Dean",
    icon: Users,
    title: "Principal & Campus Dean",
    level: "Oversight & Escalation Authority",
    badge: "Executive Tier",
    color: "from-rose-500 to-amber-600",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.3)]",
    borderActive: "border-rose-400",
    summary: "Campus leadership monitors university-wide operations, delayed tickets exceeding SLA thresholds, and department response performance.",
    permissions: [
      "Cross-department bird's-eye operational dashboard",
      "Immediate alert system for tickets exceeding 24h SLA",
      "Automated weekly infrastructure health & cost reports",
      "Direct executive escalation to maintenance chief",
    ],
    restrictions: [
      "Execution handled by field teams; oversight role",
    ],
    simulatedPreview: {
      header: "Executive Command • Campus Leadership Console",
      sub: "University Infrastructure Readiness: 98.6% across 22 Faculties",
      mockStat1: { label: "SLA Adherence", val: "99.1% On-Time" },
      mockStat2: { label: "Escalated Cases", val: "0 Critical Delays" },
      mockAction: "Export Monthly Audit PDF",
      mockActionColor: "bg-rose-500 text-white hover:bg-rose-400",
    },
  },
  {
    id: "staff",
    tabLabel: "Field Engineer",
    icon: Wrench,
    title: "Maintenance Technician / Staff",
    level: "Field Execution Role",
    badge: "Execution Tier",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.3)]",
    borderActive: "border-emerald-400",
    summary: "On-field engineers receive work orders on mobile, update progress in real time, and upload geo-stamped photos of finished work to close tickets.",
    permissions: [
      "Mobile-optimized task list with room navigation",
      "Live status toggles (In-Progress, On-Hold, Completed)",
      "Mandatory before & after photo evidence upload",
      "Automated material inventory request integration",
    ],
    restrictions: [
      "Cannot close ticket without visual photo proof",
    ],
    simulatedPreview: {
      header: "Field Technician Mobile View • HVAC Unit #42",
      sub: "Work Order #PU-8821: Compressor capacitor replaced & pressure restored",
      mockStat1: { label: "Work Duration", val: "38 minutes" },
      mockStat2: { label: "Proof Uploaded", val: "2 Verified Images ✓" },
      mockAction: "Mark Complete & Request Sign-off",
      mockActionColor: "bg-emerald-400 text-black hover:bg-emerald-300",
    },
  },
  {
    id: "admin",
    tabLabel: "Campus Admin",
    icon: ShieldCheck,
    title: "Administrator (University Cell)",
    level: "Total Governance Authority",
    badge: "Super Admin",
    color: "from-amber-400 to-[#E0C88B]",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.35)]",
    borderActive: "border-amber-400",
    summary: "Central administrative cell managing system users, building and asset registries, automated escalation SLA rules, and campus-wide compliance.",
    permissions: [
      "Complete user role-based access management (RBAC)",
      "Configure campus buildings, departments, and categories",
      "Set custom SLA countdown thresholds and alert webhooks",
      "Audit trail logs for all state changes & security events",
    ],
    restrictions: [],
    simulatedPreview: {
      header: "Central Governance • System Configuration Matrix",
      sub: "Global Campus Configuration: 1,420 Active Users • 48 Buildings",
      mockStat1: { label: "System Health", val: "Optimal (100%)" },
      mockStat2: { label: "Security Logs", val: "Encrypted & Audited" },
      mockAction: "Configure Global SLA Rules",
      mockActionColor: "bg-[#E0C88B] text-black hover:bg-[#F3E5AB]",
    },
  },
];

const RolesSection = () => {
  const [selectedRole, setSelectedRole] = useState(rolesData[0].id);

  const activeRole = rolesData.find(r => r.id === selectedRole) || rolesData[0];
  const IconComponent = activeRole.icon;

  return (
    <section id="roles-section" data-tour="roles-section" className="py-24 relative overflow-hidden">
      {/* Premium ambient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060F10]/50 via-transparent to-[#0B1416]/50 pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-[550px] h-[550px] bg-[#E0C88B]/08 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-6 py-2.5 glass-panel text-[#E0C88B] rounded-full text-xs font-semibold tracking-[0.2em] uppercase mb-6 shadow-[0_0_20px_rgba(224,200,139,0.25)] border-[#E0C88B]/40 bg-[#E0C88B]/10 font-sans font-bold">
            Interactive Access Control
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-black mb-4 tracking-tight">
            <span className="text-gradient-royal">Role-Based</span>{" "}
            <span className="text-gradient-gold font-extrabold">Command Console</span>
          </h2>
          <p className="text-slate-300 font-normal max-w-2xl mx-auto text-base md:text-lg font-sans">
            Click any campus role to inspect their permissions, capabilities, and live operational dashboard.
          </p>

          {/* Interactive Role Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {rolesData.map((role) => {
              const isSelected = selectedRole === role.id;
              const RoleIcon = role.icon;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] text-[#060F10] shadow-[0_0_25px_rgba(224,200,139,0.4)] scale-105 font-bold"
                      : "glass-panel-dark text-slate-300 hover:text-white border border-white/10 hover:border-[#E0C88B]/40"
                  }`}
                >
                  <RoleIcon className={`w-4 h-4 ${isSelected ? 'text-[#060F10]' : 'text-[#E0C88B]'}`} />
                  <span>{role.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Console Window for Selected Role */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="glass-panel-dark rounded-3xl p-6 sm:p-10 border border-white/15 dark:border-[#E0C88B]/30 shadow-2xl relative overflow-hidden"
          >
            {/* Holographic background beam */}
            <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${activeRole.color} opacity-10 rounded-full blur-3xl pointer-events-none`} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Role Metadata & Permissions (Cols 1-7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E0C88B]/20 text-[#E0C88B] flex items-center justify-center border border-[#E0C88B]/40 shadow-[0_0_20px_rgba(224,200,139,0.3)]">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                        {activeRole.title}
                      </h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-[#E0C88B] border border-white/15 font-bold">
                        {activeRole.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{activeRole.level}</p>
                  </div>
                </div>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                  {activeRole.summary}
                </p>

                {/* Permissions Matrix */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#E0C88B] font-bold block">
                    Core Capabilities & Authority
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeRole.permissions.map((perm, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/05 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {activeRole.restrictions.length > 0 && (
                  <div className="pt-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold block mb-2">
                      Governance Boundaries
                    </span>
                    <div className="space-y-1.5">
                      {activeRole.restrictions.map((rest, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-slate-400"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400/80 shrink-0" />
                          <span>{rest}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Simulated Role Terminal / UI Viewport (Cols 8-12) */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-white/15 bg-black/60 p-5 shadow-inner backdrop-blur-xl space-y-4">
                  {/* Mock Terminal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 ml-2">
                        PU-UNICARE v2.8 // {activeRole.id.toUpperCase()}
                      </span>
                    </div>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>

                  {/* Mock Window Content */}
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">
                      {activeRole.simulatedPreview.header}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {activeRole.simulatedPreview.sub}
                    </p>
                  </div>

                  {/* Mock Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        {activeRole.simulatedPreview.mockStat1.label}
                      </span>
                      <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                        {activeRole.simulatedPreview.mockStat1.val}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        {activeRole.simulatedPreview.mockStat2.label}
                      </span>
                      <span className="text-sm font-bold text-[#E0C88B] font-mono mt-0.5 block">
                        {activeRole.simulatedPreview.mockStat2.val}
                      </span>
                    </div>
                  </div>

                  {/* Mock Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold font-mono transition-transform duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 ${activeRole.simulatedPreview.mockActionColor}`}
                    >
                      <span>{activeRole.simulatedPreview.mockAction}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Footer status */}
                  <div className="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-white/05">
                    Live Role Authentication & Encryption Active
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};

export default RolesSection;
