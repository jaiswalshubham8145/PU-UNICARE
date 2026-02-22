import { User, GraduationCap, UserCog, Users, Wrench, ShieldCheck } from "lucide-react";

const roles = [
  {
    icon: User,
    title: "Class Faculty",
    level: "Primary Authority",
    permissions: [
      "File maintenance complaints",
      "Upload images/videos",
      "Track issue status",
      "Grant CR access",
      "Verify completion",
    ],
    restrictions: ["Cannot assign staff", "Cannot modify timelines"],
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: GraduationCap,
    title: "Class Representative",
    level: "Limited Access",
    permissions: [
      "File complaints (faculty-approved)",
      "Upload issue evidence",
    ],
    restrictions: ["Cannot change status", "Cannot assign tasks", "Cannot close complaints"],
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: UserCog,
    title: "Head of Department",
    level: "Approval Authority",
    permissions: [
      "Receive complaints auto",
      "Approve/reject complaints",
      "Assign maintenance staff",
      "Define resolution timeline",
      "Update progress",
    ],
    restrictions: [],
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Principal / Dean",
    level: "Monitoring Authority",
    permissions: [
      "Monitor all department issues",
      "View delayed complaints",
      "Escalate unresolved cases",
      "Analyze performance",
    ],
    restrictions: [],
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: Wrench,
    title: "Maintenance Staff",
    level: "Execution Role",
    permissions: [
      "View assigned tasks",
      "Update progress",
      "Upload work-completion proof",
      "Mark tasks completed",
    ],
    restrictions: [],
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "Admin (University Cell)",
    level: "Full Control",
    permissions: [
      "Manage users & roles",
      "Configure departments",
      "Define SLA rules",
      "Generate reports",
      "System-wide monitoring",
    ],
    restrictions: [],
    color: "from-emerald-500 to-emerald-600",
  },
];

const RolesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-2.5 glass-panel text-violet-300 rounded-full text-sm font-bold tracking-widest uppercase mb-6 border-violet-400/20">
            Access Control
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-royal">Role-Based</span>{" "}
            <span className="text-gradient-gold">Security Model</span>
          </h2>
          <p className="text-blue-100/80 font-medium max-w-2xl mx-auto">
            Every user has defined permissions ensuring accountability and security across the system.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div
              key={index}
              className="card-elevated hover-lift overflow-hidden"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${role.color} p-5`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <role.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{role.title}</h3>
                    <span className="text-white/80 text-sm">{role.level}</span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="p-5">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Can:
                </h4>
                <ul className="space-y-2 mb-4">
                  {role.permissions.map((perm, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                      {perm}
                    </li>
                  ))}
                </ul>

                {role.restrictions.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cannot:
                    </h4>
                    <ul className="space-y-2">
                      {role.restrictions.map((rest, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                          {rest}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
