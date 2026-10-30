import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Target, Users, Clock, Award, CheckCircle } from "lucide-react";

const About = () => {
  return (
    <div className="relative z-10 min-h-screen noise-texture">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-24 glass-low noise-texture">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-6">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-blue-600 text-sm font-bold">About Unicare</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-600">
                Transforming Campus Maintenance at Parul University
              </h1>
              <p className="text-3xl font-extrabold text-blue-700 max-w-4xl mx-auto">
                A centralized, role-based digital maintenance management system designed for excellence.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="card-elevated p-8">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-yellow-600 mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To ensure fast, transparent, and accountable maintenance operations across classrooms,
                  departments, laboratories, and the entire campus infrastructure of Parul University.
                  We strive to create a seamless experience where maintenance issues are resolved
                  efficiently while maintaining complete accountability.
                </p>
              </div>
              <div className="card-elevated p-8">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-yellow-600 mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become the benchmark for university maintenance management systems in India,
                  leveraging technology to create a proactive maintenance culture that enhances
                  the learning environment and campus experience for all students, faculty,
                  and staff at Parul University.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Guarantees */}
        <section className="py-24 glass-section noise-texture">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-yellow-600 mb-4">
                Our Guarantees
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                UNICARE is built on four core principles that ensure excellence in maintenance management.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Clock,
                  title: "24-Hour Acknowledgment",
                  description: "Every complaint is acknowledged within 24 hours, guaranteed.",
                },
                {
                  icon: CheckCircle,
                  title: "Clear Timelines",
                  description: "Resolution timelines are clearly defined for every issue.",
                },
                {
                  icon: Users,
                  title: "Transparent Tracking",
                  description: "Progress is transparently tracked and visible to all stakeholders.",
                },
                {
                  icon: Shield,
                  title: "Full Accountability",
                  description: "Accountability is maintained at every level of the process.",
                },
              ].map((item, i) => (
                <div key={i} className="card-elevated p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent mx-auto flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-yellow-600 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Parul University */}
        <section className="py-24 glass-section noise-texture">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  About Parul University
                </h2>
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="leading-relaxed mb-6">
                  Parul University is one of the leading private universities in Gujarat, India,
                  known for its commitment to academic excellence and holistic development.
                  With a sprawling campus equipped with state-of-the-art facilities, the university
                  hosts thousands of students across various disciplines.
                </p>
                <p className="leading-relaxed mb-6">
                  The university's commitment to providing the best infrastructure for its students
                  and faculty led to the development of UNICARE - a comprehensive maintenance
                  management system that ensures every facility on campus is maintained to the
                  highest standards.
                </p>
                <p className="leading-relaxed">
                  Located in Vadodara, Gujarat, Parul University continues to set new benchmarks
                  in higher education while embracing technology to enhance campus operations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
