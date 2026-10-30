import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060F10] via-[#0C1B1C] to-[#164340]" />

      {/* Radiant Glowing Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E0C88B]/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/30 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-300/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="text-white">Ready to Transform </span>
            <span className="text-gradient-gold block sm:inline mt-1">
              <span className="font-extrabold text-gradient-gold">Campus Care?</span>
            </span>
          </h2>
          <p className="text-xl text-[#EDE3CC]/90 mb-10 leading-relaxed font-medium">
            Join UNICARE and experience fast, transparent, and accountable maintenance management across Parul University.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="xl" asChild className="bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] font-bold border-none shadow-[0_0_45px_rgba(224,200,139,0.6)] hover:shadow-[0_0_70px_rgba(224,200,139,0.9)] transition-all duration-300 hover:scale-[1.03] rounded-2xl">
              <Link to="/register-complaint">
                Report an Issue <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="xl" asChild className="bg-white/10 hover:bg-emerald-400/20 text-[#EDE3CC] font-bold border border-emerald-400/50 hover:border-emerald-300/90 shadow-[0_0_30px_rgba(52,211,153,0.35)] hover:shadow-[0_0_50px_rgba(52,211,153,0.6)] backdrop-blur-xl transition-all duration-300 rounded-2xl">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[#A9B5AC]">
            <a href="tel:+919972623969" className="flex items-center gap-2 hover:text-[#C2A05A] transition-colors font-medium">
              <Phone className="w-5 h-5" />
              <span>+91 99726239369</span>
            </a>
            <a href="mailto:unicare@paruluniversity.ac.in" className="flex items-center gap-2 hover:text-[#C2A05A] transition-colors font-medium">
              <Mail className="w-5 h-5" />
              <span>unicare@paruluniversity.ac.in</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
