import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden mt-20">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-950" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold text-gradient-gold tracking-tight">Unicare</span>
                <p className="text-sm text-violet-300 font-medium tracking-widest uppercase">PARUL UNIVERSITY</p>
              </div>
            </div>
            <p className="text-violet-100/70 text-base leading-relaxed mb-8">
              Centralized University Maintenance Management System ensuring fast, transparent, and accountable maintenance operations across campus.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-violet-400/20 flex items-center justify-center hover:bg-gradient-to-br hover:from-violet-500 hover:to-purple-600 hover:text-white hover:border-violet-500 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-xl mb-8 text-white">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: "Home", path: "/" },
                { name: "About Unicare", path: "/about" },
                { name: "Maintenance Categories", path: "/maintenance" },
                { name: "Register Complaint", path: "/register-complaint" },
                { name: "Track Complaint", path: "/track" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-amber-400 transition-all duration-300 text-base font-medium hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Maintenance */}
          <div>
            <h4 className="font-bold text-xl mb-8 text-white">Maintenance</h4>
            <ul className="space-y-4">
              {[
                "Classroom Maintenance",
                "Laboratory Maintenance",
                "Department Maintenance",
                "Campus Infrastructure",
                "Safety & Security",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/maintenance"
                    className="text-slate-300 hover:text-amber-400 transition-all duration-300 text-base font-medium hover:translate-x-1 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-xl mb-8 text-white">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <MapPin className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-slate-300 text-base leading-relaxed">
                  Parul University, P.O. Limda, Ta. Waghodia, Vadodara, Gujarat 391760
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Phone className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-slate-300 text-base font-medium">+91 99726239369</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Mail className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-slate-300 text-base font-medium">unicare@paruluniversity.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-400 text-base flex flex-col md:flex-row items-center md:items-start gap-2">
            <p>© 2024 UNICARE - Parul University. All rights reserved.</p>
            <span className="hidden md:inline text-slate-600">|</span>
            <p className="text-violet-300 font-medium">creator:- SHUBHAM JAISWAL</p>
          </div>
          <div className="flex gap-8">
            <Link to="/policies" className="text-slate-400 hover:text-amber-400 text-base font-medium transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/policies" className="text-slate-400 hover:text-amber-400 text-base font-medium transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
