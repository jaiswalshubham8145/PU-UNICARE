import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900" />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Ready to Transform </span>
            <span className="text-gradient-gold">Campus Maintenance?</span>
          </h2>
          <p className="text-xl text-violet-100/80 mb-10 leading-relaxed font-medium">
            Join UNICARE and experience fast, transparent, and accountable maintenance management across Parul University.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="xl" asChild className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-white font-bold border-none shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:shadow-[0_0_60px_rgba(251,191,36,0.4)] transition-all duration-300 hover:scale-[1.02] rounded-2xl">
              <Link to="/register-complaint">
                Report an Issue <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="xl" asChild className="bg-white/10 hover:bg-white/20 text-white font-bold border border-violet-400/30 hover:border-violet-400/50 backdrop-blur-xl transition-all duration-300 rounded-2xl">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-violet-100/70">
            <a href="tel:+919972623969" className="flex items-center gap-2 hover:text-amber-400 transition-colors font-medium">
              <Phone className="w-5 h-5" />
              <span>+91 99726239369</span>
            </a>
            <a href="mailto:unicare@paruluniversity.ac.in" className="flex items-center gap-2 hover:text-amber-400 transition-colors font-medium">
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
