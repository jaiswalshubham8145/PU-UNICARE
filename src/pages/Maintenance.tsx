import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  School, Building2, FlaskConical, Bath, TreePine, ShieldAlert, Zap,
  Lightbulb, Fan, Monitor, Speaker, DoorOpen, Plug, Snowflake, Sparkles,
  Armchair, Printer, Wifi, BatteryCharging, StickyNote, Archive,
  Microscope, Lock, HardDrive, Droplet, Flame, Table2,
  ShowerHead, Waves, AlertTriangle, Calendar, Wrench, SquareStack,
  Route, Car, Flower2, Lamp, Trash2,
  Camera, FireExtinguisher, LogOut, ShieldCheck, KeyRound,
  ArrowUpDown, Power, Container, Sun, Megaphone, Network
} from "lucide-react";
import classroomImg from "@/assets/classroom.jpg";
import laboratoryImg from "@/assets/laboratory.jpg";
import departmentImg from "@/assets/office .jpeg";
import washroomImg from "@/assets/washroom .jpeg";
import campusImg from "@/assets/campus main .jpeg";
import safetyImg from "@/assets/cctv.jpeg";
import utilitiesImg from "@/assets/uitilies.jpeg";
import lightImg from "@/assets/light .jpeg";
import fansImg from "@/assets/fans .jpeg";
import projectorImg from "@/assets/projector .jpeg";
import audioImg from "@/assets/audio .jpeg";
import benchesImg from "@/assets/Benches .jpeg";
import doorsImg from "@/assets/doors .jpeg";
import socketImg from "@/assets/shoket .jpeg";
import acImg from "@/assets/ac.jpeg";
import cleanlinessImg from "@/assets/Cleanliness.jpeg";
import cabinImg from "@/assets/cabin .jpeg";
import interfaceImg from "@/assets/interface .jpeg";
import printerImg from "@/assets/printer .jpeg";
import wifiImg from "@/assets/wifii.jpeg";
import backupImg from "@/assets/back up .jpeg";
import noticeImg from "@/assets/notice board .jpeg";
import storageImg from "@/assets/storage .jpeg";
import labEquipImg from "@/assets/lab equipment .jpeg";
import safetyLabImg from "@/assets/safety .jpeg";
import softwareImg from "@/assets/software .jpeg";
import hardwareImg from "@/assets/system hardware .jpeg";
import waterLabImg from "@/assets/water .jpeg";
import labFurnitureImg from "@/assets/lab funture .jpeg";
import fireExImg from "@/assets/fire ex.jpeg";
import waterSupplyImg from "@/assets/water .jpeg";
import drainageImg from "@/assets/water drainage .jpeg";
import leakageImg from "@/assets/leakage water .jpeg";
import sanitationImg from "@/assets/satanisation .jpeg";
import cleaningImg from "@/assets/cleaning .jpeg";
import tilesImg from "@/assets/tiles .jpeg";
import roadImg from "@/assets/road.jpeg";
import parkingImg from "@/assets/parking .jpeg";
import gardenImg from "@/assets/garden .jpeg";
import streetLightImg from "@/assets/street light .jpeg";
import drainageCampusImg from "@/assets/drainage .jpeg";
import wasteImg from "@/assets/waste management .jpeg";
import cctvImg from "@/assets/cctv.jpeg";
import fireImg from "@/assets/fire .jpeg";
import emergencyImg from "@/assets/emergency exit .jpeg";
import securityLightImg from "@/assets/safety.jpeg";
import accessImg from "@/assets/access control .jpeg";
import liftImg from "@/assets/lift .jpeg";
import generatorImg from "@/assets/generator .jpeg";
import waterTankImg from "@/assets/water storage .jpeg";
import solarImg from "@/assets/solar system .jpeg";
import paImg from "@/assets/pa systems .jpeg";
import internetImg from "@/assets/internet .jpeg";
import maintenanceVideo from "@/assets/Infrastructure.mp4";

const maintenanceData = [
  {
    id: "classroom",
    icon: School,
    title: "Classroom Maintenance",
    color: "from-blue-500 to-blue-600",
    image: classroomImg,
    items: [
      { icon: Lightbulb, name: "Lighting", desc: "Tube lights, bulbs, LED panels", image: lightImg },
      { icon: Fan, name: "Fans & Ventilation", desc: "Ceiling fans, exhaust fans", image: fansImg },
      { icon: Monitor, name: "Smart Boards & Projectors", desc: "Interactive displays, projectors", image: projectorImg },
      { icon: Speaker, name: "Audio Systems", desc: "Microphones, speakers, amplifiers", image: audioImg },
      { icon: Armchair, name: "Benches & Desks", desc: "Student seating, podium", image: benchesImg },
      { icon: DoorOpen, name: "Doors & Windows", desc: "Locks, hinges, glass panels", image: doorsImg },
      { icon: Plug, name: "Electrical Sockets", desc: "Power outlets, extension boards", image: socketImg },
      { icon: Snowflake, name: "AC Systems", desc: "Air conditioning units", image: acImg },
      { icon: Sparkles, name: "Cleanliness", desc: "General hygiene maintenance", image: cleanlinessImg },
    ],
  },
  {
    id: "department",
    icon: Building2,
    title: "Department Maintenance",
    color: "from-emerald-500 to-emerald-600",
    image: departmentImg,
    items: [
      { icon: DoorOpen, name: "Faculty Cabins", desc: "Office spaces, partitions", image: cabinImg },
      { icon: Monitor, name: "Office Equipment", desc: "Computers, monitors", image: interfaceImg },
      { icon: Printer, name: "Printers & Scanners", desc: "Printing devices", image: printerImg },
      { icon: Wifi, name: "Internet & Wi-Fi", desc: "Network connectivity", image: wifiImg },
      { icon: BatteryCharging, name: "Power Backup", desc: "UPS systems", image: backupImg },
      { icon: StickyNote, name: "Notice Boards", desc: "Display boards", image: noticeImg },
      { icon: Archive, name: "Storage & Furniture", desc: "Cabinets, shelves", image: storageImg },
    ],
  },
  {
    id: "laboratory",
    icon: FlaskConical,
    title: "Laboratory Maintenance",
    color: "from-purple-500 to-purple-600",
    image: laboratoryImg,
    items: [
      { icon: Microscope, name: "Lab Instruments", desc: "Scientific equipment", image: labEquipImg },
      { icon: Lock, name: "Electrical Safety", desc: "Safety switches, grounding", image: safetyLabImg },
      { icon: HardDrive, name: "Software & Licenses", desc: "Lab software", image: softwareImg },
      { icon: Monitor, name: "System Hardware", desc: "Computers, peripherals", image: hardwareImg },
      { icon: Droplet, name: "Gas & Water Pipelines", desc: "Lab utilities", image: waterLabImg },
      { icon: Table2, name: "Lab Furniture", desc: "Workbenches, stools", image: labFurnitureImg },
      { icon: Flame, name: "Safety Equipment", desc: "Fire safety, first aid", image: fireExImg },
    ],
  },
  {
    id: "washroom",
    icon: Bath,
    title: "Washroom & Hygiene",
    color: "from-cyan-500 to-cyan-600",
    image: washroomImg,
    items: [
      { icon: ShowerHead, name: "Water Supply", desc: "Taps, water pressure", image: waterSupplyImg },
      { icon: Waves, name: "Flush & Drainage", desc: "Toilet systems", image: drainageImg },
      { icon: Droplet, name: "Leakage", desc: "Pipe leaks, seepage", image: leakageImg },
      { icon: Sparkles, name: "Sanitation", desc: "Cleaning, disinfection", image: sanitationImg },
      { icon: Calendar, name: "Cleaning Schedule", desc: "Regular maintenance", image: cleaningImg },
      { icon: Wrench, name: "Fittings & Tiles", desc: "Fixtures, flooring", image: tilesImg },
    ],
  },
  {
    id: "campus",
    icon: TreePine,
    title: "Campus Infrastructure",
    color: "from-green-500 to-green-600",
    image: campusImg,
    items: [
      { icon: Route, name: "Roads & Pathways", desc: "Walking paths, roads", image: roadImg },
      { icon: Car, name: "Parking Areas", desc: "Vehicle parking", image: parkingImg },
      { icon: Flower2, name: "Gardens & Landscaping", desc: "Green areas", image: gardenImg },
      { icon: Lamp, name: "Street Lighting", desc: "Outdoor lights", image: streetLightImg },
      { icon: Waves, name: "Drainage Systems", desc: "Stormwater management", image: drainageCampusImg },
      { icon: Trash2, name: "Waste Management", desc: "Bins, disposal", image: wasteImg },
    ],
  },
  {
    id: "safety",
    icon: ShieldAlert,
    title: "Safety & Security",
    color: "from-red-500 to-red-600",
    image: safetyImg,
    items: [
      { icon: Camera, name: "CCTV Systems", desc: "Surveillance cameras", image: cctvImg },
      { icon: FireExtinguisher, name: "Fire Extinguishers", desc: "Fire safety equipment", image: fireImg },
      { icon: LogOut, name: "Emergency Exits", desc: "Exit signs, pathways", image: emergencyImg },
      { icon: Lamp, name: "Security Lighting", desc: "Perimeter lights", image: securityLightImg },
      { icon: KeyRound, name: "Access Control", desc: "Entry systems", image: accessImg },
    ],
  },

  {
    id: "utilities",
    icon: Zap,
    title: "Utilities & Services",
    color: "from-amber-500 to-amber-600",
    image: utilitiesImg,
    items: [
      { icon: ArrowUpDown, name: "Lifts", desc: "Elevators", image: liftImg },
      { icon: Power, name: "Generators", desc: "Backup power", image: generatorImg },
      { icon: Container, name: "Water Tanks", desc: "Storage tanks", image: waterTankImg },
      { icon: Sun, name: "Solar Systems", desc: "Solar panels", image: solarImg },
      { icon: Megaphone, name: "PA Systems", desc: "Announcement systems", image: paImg },
      { icon: Network, name: "Internet Backbone", desc: "Network infrastructure", image: internetImg },
    ],
  },
];

const Maintenance = () => {
  return (
    <div className="relative z-10 min-h-screen noise-texture">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-24 noise-texture">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <span className="inline-block px-4 py-1.5 bg-blue-50/50 backdrop-blur-sm border border-blue-100 text-blue-700 rounded-full text-sm font-bold mb-5 shadow-sm">
                Complete Coverage
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-yellow-500 drop-shadow-sm">
                Maintenance Categories
              </h1>
              <p className="text-xl text-blue-700 font-semibold leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
                Comprehensive maintenance coverage across all campus facilities and infrastructure.
              </p>
            </div>
          </div>
        </section>

        {/* Categories List */}
        <section className="py-24 noise-texture">
          <div className="container mx-auto px-4">
            <div className="space-y-16">
              {maintenanceData.map((category, index) => (
                <div key={category.id} id={category.id}>
                  <div className={`relative h-32 rounded-xl overflow-hidden mb-8 bg-gradient-to-br ${category.color}`}>
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover opacity-60"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white text-3d-category">{category.title}</h2>
                        <p className="text-white/80 text-sm font-bold text-shadow-main">{category.items.length} maintenance items</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.items.map((item, i) => (
                      <Link
                        key={i}
                        to="/register-complaint"
                        className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer block"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="relative p-4 h-full flex flex-col justify-end text-white">
                          <h3 className="font-semibold text-lg mb-1 text-3d-item">{item.name}</h3>
                          <p className="text-sm text-white/90 font-bold text-shadow-main">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {index < maintenanceData.length - 1 && (
                    <div className="border-b border-border mt-16" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Maintenance;
