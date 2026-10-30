import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully!", {
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="relative z-10 min-h-screen noise-texture">
      <Navbar />
      <main className="pt-24 pb-12">
        {/* Contact Section */}
        <section className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-6 py-2 glass-panel text-amber-500 rounded-full text-sm font-bold tracking-widest uppercase mb-6 shadow-sm">
                24/7 Support
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Get in <span className="text-gradient-gold">Touch</span>
              </h1>
              <p className="text-slate-200 text-lg max-w-2xl mx-auto">
                Have questions regarding UNICARE? We are here to help you with maintenance requests, technical issues, and general inquiries.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
              {/* Contact Info - Dark Glass */}
              <div className="glass-panel-dark p-10 rounded-3xl border-white/10 h-full">
                <h2 className="text-3xl font-bold text-white mb-8">Contact Information</h2>

                <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                      <MapPin className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-2">Campus Address</h3>
                      <p className="text-slate-300 leading-relaxed font-light">
                        Parul University, P.O. Limda, Ta. Waghodia,<br />
                        Vadodara, Gujarat 391760, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                      <Phone className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-2">Phone Support</h3>
                      <p className="text-slate-300 font-light">+91 99726239369</p>
                      <p className="text-amber-400/80 text-sm mt-1">Mon-Sat, 9am - 6pm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                      <Mail className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-2">Email Us</h3>
                      <p className="text-slate-300 font-light">unicare@paruluniversity.ac.in</p>
                      <p className="text-slate-400 text-sm mt-1">Expect a reply within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form - Lighter Glass */}
              <div className="glass-panel p-10 rounded-3xl border-white/20">
                <h2 className="text-3xl font-bold text-white mb-2">Send Message</h2>
                <p className="text-slate-300 mb-8">Fill out the form below and we will get back to you shortly.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white ml-1">Full Name</Label>
                      <Input placeholder="John Doe" className="glass-input h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white ml-1">Email Address</Label>
                      <Input type="email" placeholder="john@example.com" className="glass-input h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white ml-1">Subject</Label>
                    <Input placeholder="How can we help?" className="glass-input h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white ml-1">Message</Label>
                    <Textarea placeholder="Type your message here..." rows={5} className="glass-input rounded-xl resize-none p-4" />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02]">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
