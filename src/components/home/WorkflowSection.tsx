import { FileText, Send, UserCheck, Wrench, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Submit Complaint",
    description: "Faculty or authorized CR submits maintenance request with details, location, priority, and photo/video evidence.",
    color: "bg-blue-500",
  },
  {
    icon: Send,
    title: "Auto Notifications",
    description: "Instant alerts sent to HOD, Principal, and Maintenance Cell via Email, SMS, and WhatsApp.",
    color: "bg-purple-500",
  },
  {
    icon: UserCheck,
    title: "HOD Approval",
    description: "HOD reviews within 24 hours, approves complaint, assigns staff, and sets resolution timeline.",
    color: "bg-amber-500",
  },
  {
    icon: Wrench,
    title: "Maintenance Execution",
    description: "Assigned staff executes work, updates progress, and uploads completion proof.",
    color: "bg-emerald-500",
  },
  {
    icon: CheckCircle,
    title: "Verification & Closure",
    description: "Faculty verifies completion, provides feedback, and complaint is auto-closed.",
    color: "bg-green-600",
  },
];

const WorkflowSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-2.5 glass-panel text-violet-300 rounded-full text-sm font-bold tracking-widest uppercase mb-6 border-violet-400/20">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-royal">Streamlined Complaint</span>{" "}
            <span className="text-gradient-gold">Workflow</span>
          </h2>
          <p className="text-blue-100/80 max-w-2xl mx-auto font-medium">
            From submission to resolution — every step is tracked, transparent, and accountable.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="relative mb-20">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group text-center">
                {/* Step Number & Icon */}
                <div className="relative mb-6 inline-block">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-md bg-card border border-border relative z-10`}>
                    <step.icon className={`w-10 h-10 text-primary`} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm z-20 border-2 border-white">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Arrow (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-1/2 left-1/2">
                    {/* Space for arrow if needed */}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SLA Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center">
            <h4 className="text-xl font-bold text-foreground mb-2">24-Hour Acknowledgment</h4>
            <p className="text-muted-foreground text-sm">Mandatory initial response time for all HODs.</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center">
            <h4 className="text-xl font-bold text-foreground mb-2">Auto-Escalation</h4>
            <p className="text-muted-foreground text-sm">Automatic alerts to higher authorities if SLA is breached.</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center">
            <h4 className="text-xl font-bold text-foreground mb-2">Real-Time Updates</h4>
            <p className="text-muted-foreground text-sm">Live status tracking via SMS & Email.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
