import {
  Lightbulb, Monitor, Wrench, Droplets, Building2, ShieldAlert, Zap,
  School, FlaskConical, Bath, TreePine, Bus
} from "lucide-react";
import { Link } from "react-router-dom";
import classroomImg from "@/assets/classroom.jpg";
import laboratoryImg from "@/assets/laboratory.jpg";
import departmentImg from "@/assets/office .jpeg";
import washroomImg from "@/assets/washroom .jpeg";
import campusImg from "@/assets/campus main .jpeg";
import safetyImg from "@/assets/cctv.jpeg";
import utilitiesImg from "@/assets/uitilies.jpeg";

const categories = [
  {
    icon: School,
    title: "Classroom Maintenance",
    description: "Lighting, fans, smart boards, projectors, audio systems, benches, AC systems",
    items: ["Tube lights & bulbs", "Fans & ventilation", "Smart boards", "AC systems"],
    image: classroomImg,
    color: "from-blue-600 to-indigo-600",
  },
  {
    icon: Building2,
    title: "Department Maintenance",
    description: "Faculty cabins, office equipment, printers, Wi-Fi, power backup, furniture",
    items: ["Office equipment", "Printers & scanners", "Internet & Wi-Fi", "Storage units"],
    image: departmentImg,
    color: "from-emerald-600 to-teal-600",
  },
  {
    icon: FlaskConical,
    title: "Laboratory Maintenance",
    description: "Lab instruments, electrical safety, software licenses, system hardware",
    items: ["Lab instruments", "Safety equipment", "System hardware", "Software licenses"],
    image: laboratoryImg,
    color: "from-violet-600 to-purple-600",
  },
  {
    icon: Bath,
    title: "Washroom & Hygiene",
    description: "Water supply, flush & drainage, leakage repair, sanitation, fittings",
    items: ["Water supply", "Drainage systems", "Sanitation", "Cleaning schedule"],
    image: washroomImg,
    color: "from-cyan-600 to-sky-600",
  },
  {
    icon: TreePine,
    title: "Campus Infrastructure",
    description: "Roads, parking, gardens, street lighting, drainage, waste management",
    items: ["Roads & pathways", "Parking areas", "Gardens", "Street lighting"],
    image: campusImg,
    color: "from-green-600 to-emerald-700",
  },
  {
    icon: ShieldAlert,
    title: "Safety & Security",
    description: "CCTV systems, fire extinguishers, emergency exits, access control",
    items: ["CCTV systems", "Fire safety", "Emergency exits", "Security lighting"],
    image: safetyImg,
    color: "from-red-600 to-rose-700",
  },
  {
    icon: Zap,
    title: "Utilities & Services",
    description: "Lifts, generators, water tanks, solar systems, PA systems, internet",
    items: ["Lifts", "Generators", "Water tanks", "PA systems"],
    image: utilitiesImg,
    color: "from-amber-500 to-orange-600",
  },
];

const MaintenanceCategories = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-2.5 glass-panel text-violet-300 rounded-full text-sm font-bold tracking-widest uppercase mb-6 border-violet-400/20">
            Maintenance Modules
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-royal">Complete Campus</span>{" "}
            <span className="text-gradient-gold">Coverage</span>
          </h2>
          <p className="text-blue-100/80 font-medium max-w-2xl mx-auto">
            From classrooms to laboratories, washrooms to campus infrastructure — UNICARE covers every aspect of university maintenance.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to="/maintenance"
              className="group card-elevated hover-lift overflow-hidden"
            >
              {/* Card Image/Icon Header */}
              <div className={`h-40 relative overflow-hidden bg-gradient-to-br ${category.color}`}>
                {category.image ? (
                  <>
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <category.icon className="w-20 h-20 text-white/30" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{category.title}</h3>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.items.slice(0, 3).map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                  {category.items.length > 3 && (
                    <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">
                      +{category.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/maintenance"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
          >
            View All Categories
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MaintenanceCategories;
