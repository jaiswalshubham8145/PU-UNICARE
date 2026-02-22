import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, CheckCircle, ShieldCheck, Bell } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-transparent to-amber-900/20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-panel px-6 py-2.5 rounded-full mb-8 animate-fade-in border-violet-400/20">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
            <span className="text-violet-200 font-semibold text-sm tracking-widest uppercase">Parul University Official</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="text-gradient-royal drop-shadow-lg">Experience Campus</span>
            <br />
            <span className="text-gradient-gold block mt-2 md:mt-4 text-6xl md:text-9xl">Excellence</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-medium text-blue-100/90 mb-12 leading-relaxed max-w-4xl mx-auto drop-shadow-sm">
            The ultimate <span className="text-amber-300 font-semibold">premium platform</span> for managing campus infrastructure with
            <span className="text-violet-300 font-semibold"> unparalleled speed</span>, transparency, and accountability.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-6 mb-16">
            <Button size="lg" asChild className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-white font-bold border-none shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] rounded-2xl">
              <Link to="/register-complaint">
                Report Issue <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6 h-auto glass-panel text-white hover:bg-white/20 border-violet-400/30 hover:border-violet-400/50 rounded-2xl transition-all duration-300">
              <Link to="/track">Track Status</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { icon: Clock, value: "24hrs", label: "Acknowledgment" },
              { icon: CheckCircle, value: "98%", label: "Resolution Rate" },
              { icon: Bell, value: "Instant", label: "Notifications" },
              { icon: ShieldCheck, value: "100%", label: "Accountability" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-panel p-8 rounded-3xl hover:bg-white/15 transition-all duration-500 backdrop-blur-2xl border border-violet-400/10 hover:border-violet-400/30 group hover:-translate-y-2 card-enter"
                style={{ animationDelay: `${0.6 + i * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all duration-500">
                  <stat.icon className="w-7 h-7 text-violet-300 group-hover:text-amber-300 transition-colors duration-300" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight group-hover:text-gradient-gold transition-all">{stat.value}</div>
                <div className="text-xs md:text-sm text-violet-200/80 font-bold tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
