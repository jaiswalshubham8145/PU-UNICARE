import {
  Brain, Smartphone, Star, RefreshCcw, FileBarChart, Bell,
  Clock, TrendingUp, Shield
} from "lucide-react";
import aiCategorizationImg from "@/assets/Ai Based  categorization.jpeg";
import mobileFirstImg from "@/assets/mobile first design.jpeg";
import feedbackImg from "@/assets/feedback and rating.jpeg";
import preventiveImg from "@/assets/preventive maintainance.jpeg";
import reportsImg from "@/assets/report and analytics'.jpeg";
import alertsImg from "@/assets/multi channel alters.jpeg";
import slaImg from "@/assets/SLA management.jpeg";
import performanceImg from "@/assets/Performance Dashboard.jpeg";
import secureImg from "@/assets/Secure & Accountable.jpeg";

const features = [
  {
    icon: Brain,
    title: "AI-Based Categorization",
    description: "Automatic issue detection and categorization from text and images using AI.",
    image: aiCategorizationImg,
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Instant reporting with camera upload and real-time status tracking on any device.",
    image: mobileFirstImg,
  },
  {
    icon: Star,
    title: "Feedback & Rating",
    description: "Faculty rates maintenance quality for continuous performance evaluation.",
    image: feedbackImg,
  },
  {
    icon: RefreshCcw,
    title: "Preventive Maintenance",
    description: "Scheduled inspections, auto-generated tasks, and equipment lifecycle tracking.",
    image: preventiveImg,
  },
  {
    icon: FileBarChart,
    title: "Reports & Analytics",
    description: "Monthly/annual reports, PDF/Excel export, and audit-ready logs.",
    image: reportsImg,
  },
  {
    icon: Bell,
    title: "Multi-Channel Alerts",
    description: "Status updates and escalations via Email, SMS, and WhatsApp.",
    image: alertsImg,
  },
  {
    icon: Clock,
    title: "SLA Management",
    description: "24-hour acknowledgment guarantee with automatic escalation system.",
    image: slaImg,
  },
  {
    icon: TrendingUp,
    title: "Performance Dashboard",
    description: "Department-wise analytics, resolution times, and trend analysis.",
    image: performanceImg,
  },
  {
    icon: Shield,
    title: "Secure & Accountable",
    description: "Role-based access control with complete audit trail for every action.",
    image: secureImg,
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-amber-950/10 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-2.5 glass-panel text-violet-300 rounded-full text-sm font-bold tracking-widest uppercase mb-6 shadow-sm border-violet-400/20">
            Premium Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-sm">
            <span className="text-gradient-royal">Smart Additions for</span>{" "}
            <span className="text-gradient-gold">Maximum Efficiency</span>
          </h2>
          <p className="text-blue-100/80 max-w-3xl mx-auto text-lg leading-relaxed font-medium">
            UNICARE defines state-of-the-art facility management. Every tool is crafted for precision, speed, and ease of use.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative h-72 rounded-3xl overflow-hidden glass-panel border-violet-400/10 hover:border-violet-400/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-500 card-hover-effect card-enter"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {feature.image ? (
                <>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-purple-950/60 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 to-purple-950/50 flex items-center justify-center">
                  <feature.icon className="w-24 h-24 text-violet-400/20" />
                </div>
              )}
              <div className="relative p-8 h-full flex flex-col justify-end text-white z-20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 backdrop-blur-md flex items-center justify-center mb-4 border border-violet-400/20 group-hover:from-amber-500/40 group-hover:to-orange-500/40 group-hover:border-amber-400/30 transition-all duration-300 shadow-lg">
                  <feature.icon className="w-6 h-6 text-violet-200 group-hover:text-amber-200 transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-2 leading-tight text-white group-hover:text-gradient-gold transition-colors">{feature.title}</h3>
                <p className="text-sm text-violet-100/80 leading-relaxed font-medium line-clamp-2 group-hover:text-violet-50 transition-colors">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
