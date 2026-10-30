import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  School, Building2, FlaskConical, Bath, TreePine, ShieldAlert, Zap,
  Lightbulb, Fan, Monitor, Speaker, DoorOpen, Plug, Snowflake, Sparkles,
  Armchair, Printer, Wifi, BatteryCharging, StickyNote, Archive,
  Microscope, Lock, HardDrive, Droplet, Flame, Table2,
  ShowerHead, Waves, Calendar, Wrench,
  Route, Car, Flower2, Lamp, Trash2,
  Camera, FireExtinguisher, LogOut, KeyRound,
  ArrowUpDown, Power, Container, Sun, Megaphone, Network,
  ArrowRight, ShieldCheck, Search, X, Clock, CheckCircle2,
  AlertTriangle, Compass, Phone, Activity
} from "lucide-react";

interface MaintenanceItem {
  icon: typeof Lightbulb;
  name: string;
  desc: string;
  image: string;
  sla: string;
  symptoms: string[];
}

interface MaintenanceCategory {
  id: string;
  icon: typeof School;
  title: string;
  badge: string;
  color: string;
  image: string;
  items: MaintenanceItem[];
}

const maintenanceData: MaintenanceCategory[] = [
  {
    id: "classroom",
    icon: School,
    title: "Classroom Maintenance",
    badge: "Academic Blocks",
    color: "from-emerald-600 via-teal-700 to-emerald-900",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80",
    items: [
      {
        icon: Lightbulb,
        name: "Lighting & Illumination",
        desc: "Tube lights, fluorescent fixtures, LED panels & dimmers",
        image: "https://images.unsplash.com/photo-1535868463750-c78d9543614f?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Bulb flickering", "Tube light burnout", "Switchboard sparking", "Inadequate classroom lux level"],
      },
      {
        icon: Fan,
        name: "Fans & Ventilation",
        desc: "Ceiling fans, regulator units, wall air circulators",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Modern_ceiling_fan.jpg",
        sla: "< 2 Hours",
        symptoms: ["Slow rotation speed", "Grinding bearing noise", "Regulator knob stuck", "Loose mounting wobble"],
      },
      {
        icon: Monitor,
        name: "Smart Boards & Projectors",
        desc: "Interactive digital podiums, beamers, HDMI matrices",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour (Priority)",
        symptoms: ["Touch calibration offset", "No HDMI signal input", "Projector lamp burnt", "Audio output dead"],
      },
      {
        icon: Speaker,
        name: "Audio Systems & Mics",
        desc: "Collar wireless microphones, ceiling speaker arrays",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["Mic feedback howl", "Static buzzing noise", "Amplifier power cut", "Dead battery pack"],
      },
      {
        icon: Armchair,
        name: "Benches & Lecture Seating",
        desc: "Ergonomic dual student desks, podiums, chairs",
        image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80",
        sla: "< 4 Hours",
        symptoms: ["Broken wooden plank", "Wobbly steel frame", "Sharp screw exposed", "Damaged desk surface"],
      },
      {
        icon: DoorOpen,
        name: "Doors & Glass Windows",
        desc: "Hydraulic door closers, security mortise locks, hinges",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        sla: "< 3 Hours",
        symptoms: ["Door won't latch", "Hydraulic closer slamming", "Broken window latch", "Cracked glass pane"],
      },
      {
        icon: Plug,
        name: "Electrical Sockets & Strips",
        desc: "Laptop power outlets, podium distribution boxes",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/British_standard_socket.jpg/800px-British_standard_socket.jpg",
        sla: "< 1 Hour",
        symptoms: ["Socket short-circuit", "Loose contact spark", "Burn mark around pin", "Tripped local MCB"],
      },
      {
        icon: Snowflake,
        name: "Split & Central AC Systems",
        desc: "Classroom inverter AC units, thermostat remotes",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Warm air blowing", "Water dripping on desks", "Refrigerant odor", "No power on display"],
      },
      {
        icon: Sparkles,
        name: "Classroom Hygiene & Cleanliness",
        desc: "Floor scrub sanitation, chalkboard wipes, waste bins",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["Dust accumulation", "Full overflow waste bins", "Drink spillage", "Unsanitized desks"],
      },
    ],
  },
  {
    id: "department",
    icon: Building2,
    title: "Department Maintenance",
    badge: "Faculty & Admin",
    color: "from-teal-600 via-emerald-800 to-slate-900",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    items: [
      {
        icon: DoorOpen,
        name: "Faculty Cabins & Hubs",
        desc: "Cabin lighting, acoustic partitions, key access locks",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
        sla: "< 3 Hours",
        symptoms: ["Door lock jammed", "Acoustic seal broken", "AC remote failure", "Cabin light replacement"],
      },
      {
        icon: Monitor,
        name: "Office Workstations & PCs",
        desc: "Dual-monitor office PCs, peripherals, power strips",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["PC won't boot", "Monitor flickering", "Mouse / keyboard failure", "Power surge shutoff"],
      },
      {
        icon: Printer,
        name: "Printers, Copiers & Scanners",
        desc: "Heavy-duty departmental laser printers & toners",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Paper jam error", "Toner replacement needed", "Network offline", "Smudged print output"],
      },
      {
        icon: Wifi,
        name: "Enterprise Campus Wi-Fi",
        desc: "Ceiling access points, router nodes, ethernet ports",
        image: "https://images.unsplash.com/photo-1745847768408-b7b83796cae6?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["No internet access", "Access point blinking red", "Slow download speed", "Ethernet port broken"],
      },
      {
        icon: BatteryCharging,
        name: "Departmental UPS & Backup",
        desc: "Online power backup banks for server rooms & admin",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["Continuous beep alarm", "Battery swollen or leak", "Zero runtime on power cut", "High temperature warning"],
      },
      {
        icon: StickyNote,
        name: "Notice Boards & Displays",
        desc: "Departmental acrylic & digital bulletin monitors",
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
        sla: "< 4 Hours",
        symptoms: ["Fallen pinboard frame", "Digital display black screen", "Cracked acrylic glass", "Flickering HDMI link"],
      },
      {
        icon: Archive,
        name: "Storage Cabinets & Lockers",
        desc: "Confidential academic archive files & locker units",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        sla: "< 4 Hours",
        symptoms: ["Broken key stuck in lock", "Drawer runner derailed", "Locker door misaligned", "Handle broken off"],
      },
    ],
  },
  {
    id: "laboratory",
    icon: FlaskConical,
    title: "Laboratory Maintenance",
    badge: "Research & Science",
    color: "from-blue-700 via-indigo-900 to-slate-900",
    image: "https://images.unsplash.com/photo-1581093577421-f561a654a353?auto=format&fit=crop&w=1600&q=80",
    items: [
      {
        icon: Microscope,
        name: "Precision Lab Instruments",
        desc: "Optical microscopes, oscilloscopes, test meters",
        image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Calibration drift", "Blown internal fuse", "Objective lens loose", "Zero power light"],
      },
      {
        icon: Lock,
        name: "Electrical Grounding & Safety",
        desc: "Earth pit testing, zero-potential safety interlocks",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour (Urgent)",
        symptoms: ["Mild electric tingling on bench", "Earth leakage trip", "Spark at isolator switch", "Exposed wiring"],
      },
      {
        icon: HardDrive,
        name: "Simulation Software Licenses",
        desc: "Scientific CAD, MATLAB, VLSI compiler licenses",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["License server error", "Expired token warning", "Software crash on launch", "Port blocked by firewall"],
      },
      {
        icon: Monitor,
        name: "Lab Computing Rigs",
        desc: "High-spec graphics rigs, compiler workstations",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["GPU thermal throttling", "Kernel panic / blue screen", "RAM fault beep code", "LAN socket disconnected"],
      },
      {
        icon: Droplet,
        name: "Gas & Pure Water Manifolds",
        desc: "Bunsen burner lines, distilled reverse-osmosis taps",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour (Safety)",
        symptoms: ["Gas smell near valve", "Low water pressure", "Regulator leak", "Corroded nozzle tap"],
      },
      {
        icon: Table2,
        name: "Chemical-Resistant Benches",
        desc: "Acid/alkali proof phenolic resin countertops",
        image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
        sla: "< 4 Hours",
        symptoms: ["Acid corrosion spot", "Sink sealant eroded", "Worktop crack", "Loose sink drain pipe"],
      },
      {
        icon: Flame,
        name: "Lab Safety Eyewash & Showers",
        desc: "Emergency deluge showers & twin-stream eyewash",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Fire-Extinguisher.JPG",
        sla: "< 30 Mins (Critical)",
        symptoms: ["Valve stuck shut", "Low water flow", "Broken activation pull lever", "Algae in supply line"],
      },
    ],
  },
  {
    id: "washroom",
    icon: Bath,
    title: "Washroom & Hygiene",
    badge: "Health & Sanitation",
    color: "from-cyan-600 via-teal-800 to-slate-900",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=80",
    items: [
      {
        icon: ShowerHead,
        name: "Continuous Water Supply",
        desc: "Sensor faucets, pressure valves, wash basin taps",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Water_tap.jpg",
        sla: "< 1 Hour",
        symptoms: ["No water from taps", "Continuous dripping leak", "Low line pressure", "Sensor battery dead"],
      },
      {
        icon: Waves,
        name: "Flush & Drainage Lines",
        desc: "Dual-flush cisterns, urinal sensors, main drains",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["Clogged floor drain", "Urinal flush running non-stop", "Cistern handle broken", "Foul sewer odor"],
      },
      {
        icon: Droplet,
        name: "Ceiling & Pipe Leakage",
        desc: "Concealed plumbing joint leaks, seepage patches",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Water dripping through false ceiling", "Wet wall stain", "Dripping PVC elbow", "Standing water pool"],
      },
      {
        icon: Sparkles,
        name: "Sanitation & Soap Dispensers",
        desc: "Automatic soap dispensers, hand dryers, fragrance",
        image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["Empty soap dispenser", "Hand dryer blower dead", "Dispenser pump jammed", "Hygiene refill needed"],
      },
      {
        icon: Calendar,
        name: "Deep Cleaning Inspection",
        desc: "Timed hourly checks, disinfectant fogging audit",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        sla: "< 30 Mins",
        symptoms: ["Floor needs scrub machine", "Stained porcelain", "Missed shift inspection", "Mirror smudged"],
      },
      {
        icon: Wrench,
        name: "Porcelain & Mirror Fittings",
        desc: "Granite mirrors, wall hooks, vanity partitions",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        sla: "< 3 Hours",
        symptoms: ["Loose vanity mirror", "Broken cubicle door lock", "Cracked porcelain urinal", "Missing coat hook"],
      },
    ],
  },
  {
    id: "campus",
    icon: TreePine,
    title: "Campus Infrastructure",
    badge: "Environment & Grounds",
    color: "from-emerald-700 via-teal-800 to-green-950",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
    items: [
      {
        icon: Route,
        name: "Roads & Pedestrian Paths",
        desc: "Paver block pathways, speed breakers, road paint",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
        sla: "< 6 Hours",
        symptoms: ["Sunken paver block pothole", "Broken curb stone", "Loose tactile paving", "Faded pedestrian zebra mark"],
      },
      {
        icon: Car,
        name: "Parking Lots & Boom Barriers",
        desc: "RFID vehicle access gates, numbered parking bays",
        image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Boom barrier stuck vertical", "RFID reader not scanning", "Parking floodlight out", "Oil spillage on floor"],
      },
      {
        icon: Flower2,
        name: "Botanical Lawns & Irrigation",
        desc: "Sprinkler networks, lawn trims, hedge upkeep",
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
        sla: "< 4 Hours",
        symptoms: ["Broken sprinkler head geyser", "Fallen tree branch hazard", "Dry unwatered lawn patch", "Overgrown pathway bushes"],
      },
      {
        icon: Lamp,
        name: "High-Mast Street Lighting",
        desc: "Solar LED roadway lights, garden bollard poles",
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Dark pathway lamp pole", "Blinking high-mast bulb", "Exposed junction wire", "Solar charge controller trip"],
      },
      {
        icon: Waves,
        name: "Stormwater Drainage Channels",
        desc: "Campus culverts, rainwater harvest silt traps",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Waterlogging after rain", "Blocked drain grating", "Broken manhole cover", "Mosquito stagnation pool"],
      },
      {
        icon: Trash2,
        name: "Smart Waste Collection Bins",
        desc: "Segregated dry/wet recycling hubs & wheelie bins",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["Overflowing dustbin", "Damaged lid mechanism", "Foul odor near entrance", "Missing segregation label"],
      },
    ],
  },
  {
    id: "safety",
    icon: ShieldAlert,
    title: "Safety & Security",
    badge: "24/7 Protection",
    color: "from-rose-600 via-red-800 to-slate-900",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80",
    items: [
      {
        icon: Camera,
        name: "AI Perimeter CCTV Network",
        desc: "4K dome & bullet cameras with NVR video feeds",
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour (Urgent)",
        symptoms: ["Black screen video feed", "Camera angle displaced", "Infrared night vision blurred", "NVR storage full warning"],
      },
      {
        icon: FireExtinguisher,
        name: "Fire Safety & Extinguishers",
        desc: "CO2, ABC powder tanks, sprinkler water manifolds",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Fire-Extinguisher.JPG",
        sla: "< 30 Mins (Safety)",
        symptoms: ["Pressure gauge in red zone", "Dislodged safety pin", "Inspection tag expired", "Hose nozzle cracked"],
      },
      {
        icon: LogOut,
        name: "Emergency Exit Corridors",
        desc: "Battery illuminated exit signage, panic fire bars",
        image: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["Exit sign backlight off", "Fire door blocked by boxes", "Panic bar latch stuck", "Emergency stairs dark"],
      },
      {
        icon: Lamp,
        name: "Security Floodlights",
        desc: "High-intensity boundary wall illumination lights",
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        sla: "< 2 Hours",
        symptoms: ["Dark corner on perimeter", "PIR motion sensor faulty", "Water ingress in fitting", "Tripped security timer"],
      },
      {
        icon: KeyRound,
        name: "Biometric Gates & Turnstiles",
        desc: "RFID student card turnstiles, biometric gates",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        sla: "< 30 Mins",
        symptoms: ["Turnstile flap jammed", "Card reader beep error", "Emergency drop arm stuck", "Display reboot loop"],
      },
    ],
  },
  {
    id: "utilities",
    icon: Zap,
    title: "Utilities & Services",
    badge: "Core Grid Operations",
    color: "from-amber-600 via-yellow-700 to-slate-900",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
    items: [
      {
        icon: ArrowUpDown,
        name: "Smart Lifts & Elevators",
        desc: "Variable-frequency passenger elevators & ARD safety",
        image: "https://images.unsplash.com/photo-1547630824-eed1be6a27b0?auto=format&fit=crop&w=800&q=80",
        sla: "< 30 Mins (Urgent)",
        symptoms: ["Lift door reopening repeatedly", "Floor landing jerky", "Elevator fan / light off", "Floor indicator dead"],
      },
      {
        icon: Power,
        name: "Campus Diesel Generators (DG)",
        desc: "High-capacity diesel generator synchronization units",
        image: "https://upload.wikimedia.org/wikipedia/commons/8/80/Diesel_power_backup_generator.jpg",
        sla: "< 30 Mins (Critical)",
        symptoms: ["Auto-start failure on mains cut", "Exhaust smoke excessive", "Low fuel level warning", "Coolant leak under engine"],
      },
      {
        icon: Container,
        name: "Overhead Water Reservoirs",
        desc: "Hydro-pneumatic booster pumping & tank monitors",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour",
        symptoms: ["Water tank overflowing", "Booster pump motor trip", "Water level sensor faulty", "Sediment cleaning due"],
      },
      {
        icon: Sun,
        name: "Rooftop Solar Power Array",
        desc: "Grid-tie solar photovoltaic inverters & panels",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
        sla: "< 3 Hours",
        symptoms: ["Inverter error code display", "Dust coating reducing yield", "String isolator tripped", "Meter communication drop"],
      },
      {
        icon: Megaphone,
        name: "Campus Public Address (PA)",
        desc: "Central emergency broadcast amplifiers & horns",
        image: "https://upload.wikimedia.org/wikipedia/commons/6/64/Public-address-system.jpg",
        sla: "< 1 Hour",
        symptoms: ["No sound in Block C speakers", "Distorted voice output", "Mic channel dead", "Bell chime trigger failure"],
      },
      {
        icon: Network,
        name: "High-Capacity Server Backbone",
        desc: "Campus fiber optic patch panels & rack cooling",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        sla: "< 1 Hour (Critical)",
        symptoms: ["Fiber uplink light yellow/red", "Rack temperature high alert", "Loose patch cable", "PDU socket power cut"],
      },
    ],
  },
];

const categoryTabs = [
  { id: "all", label: "All Facilities (42)" },
  { id: "classroom", label: "Classrooms (9)" },
  { id: "department", label: "Faculty & Admin (7)" },
  { id: "laboratory", label: "Research Labs (7)" },
  { id: "washroom", label: "Hygiene & Sanitation (6)" },
  { id: "campus", label: "Campus Grounds (6)" },
  { id: "safety", label: "Safety & CCTV (5)" },
  { id: "utilities", label: "Power & Elevators (6)" },
];

const Maintenance = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<{ item: MaintenanceItem; category: MaintenanceCategory } | null>(null);

  // Filter items dynamically based on search and category tab
  const filteredData = useMemo(() => {
    return maintenanceData
      .filter((cat) => {
        if (selectedCategoryTab === "all") return true;
        return cat.id === selectedCategoryTab;
      })
      .map((cat) => {
        if (!searchQuery.trim()) return cat;

        const query = searchQuery.toLowerCase().trim();
        const filteredItems = cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query) ||
            item.symptoms.some((s) => s.toLowerCase().includes(query)) ||
            cat.title.toLowerCase().includes(query)
        );

        return {
          ...cat,
          items: filteredItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [searchQuery, selectedCategoryTab]);

  const totalMatchingItems = useMemo(() => {
    return filteredData.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredData]);

  const handleLaunchTicket = (itemName: string, categoryId: string) => {
    navigate(
      `/register-complaint?title=${encodeURIComponent(`${itemName} Issue`)}&category=${encodeURIComponent(
        categoryId
      )}`
    );
  };

  return (
    <div className="relative z-10 min-h-screen text-foreground selection:bg-[#E0C88B]/30 selection:text-[#F7F2E7] overflow-x-hidden">
      <Navbar />

      {/* Radiant Ambient Glows & Translucent Video Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B0D]/40 via-transparent to-[#0B1416]/50" />
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-[#E0C88B]/18 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 -right-20 w-[550px] h-[550px] bg-emerald-500/18 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-sky-500/12 rounded-full blur-[130px]" />
      </div>

      <main className="relative z-10 pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full mb-6 glass-panel border-[#E0C88B]/40 bg-[#E0C88B]/10 shadow-[0_0_25px_rgba(224,200,139,0.2)] animate-fade-in">
                <ShieldCheck className="w-5 h-5 text-[#E0C88B] drop-shadow-[0_0_8px_rgba(224,200,139,0.6)]" />
                <span className="text-[#F7F2E7] font-semibold text-xs tracking-[0.25em] uppercase font-mono">
                  Parul University Facility Grid
                </span>
              </div>

              {/* Title with Combo 1 Clash Display + Combo 4 Italic Accent */}
              <h1 className="font-display text-4xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
                <span className="text-gradient-royal font-bold">Campus Facility</span>
                <br />
                <span className="text-gradient-gold block mt-2 text-5xl md:text-8xl tracking-tight">
                  <span className="font-extrabold pr-2 text-gradient-gold">Master</span> Catalog
                </span>
              </h1>

              <p className="text-slate-300 font-sans text-base md:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-8">
                Search and inspect 42 specialized campus infrastructure systems — equipped with real-time SLA metrics, fault diagnostics, and automated technician dispatch.
              </p>

              {/* Quick Action Navigation */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] font-black text-base px-7 py-5 h-auto rounded-2xl shadow-[0_0_35px_rgba(224,200,139,0.4)] hover:shadow-[0_0_55px_rgba(224,200,139,0.7)] transition-all hover:scale-105"
                >
                  <Link to="/register-complaint">
                    File Maintenance Ticket <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="glass-panel text-slate-200 hover:text-white border-white/20 hover:border-[#E0C88B]/60 text-base px-7 py-5 h-auto rounded-2xl shadow-xl transition-all"
                >
                  <Link to="/track">Track Existing Status</Link>
                </Button>
              </div>

              {/* Live Campus Telemetry Strip */}
              <div className="glass-panel-dark rounded-2xl p-3 sm:p-4 border border-white/10 dark:border-[#E0C88B]/25 flex flex-wrap items-center justify-around gap-4 shadow-2xl text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Vadodara Campus Grid: <strong className="text-emerald-400">Online</strong></span>
                </div>
                <div className="hidden sm:inline-block text-white/20">•</div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-[#E0C88B]" />
                  <span>42 Subsystems Monitored</span>
                </div>
                <div className="hidden sm:inline-block text-white/20">•</div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Avg SLA: <strong className="text-sky-300">18 Minutes</strong></span>
                </div>
                <div className="hidden sm:inline-block text-white/20">•</div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Photographic Proof: <strong className="text-amber-300">Mandatory</strong></span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Interactive Search & Filter Controls */}
        <section className="sticky top-16 z-30 py-4 glass-nav border-y border-white/10">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-4">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#E0C88B]" />
              <Input
                type="text"
                placeholder="Search fixtures, equipment, or symptoms (e.g. AC, smart board, leakage, CCTV, lift)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-11 pr-10 h-12 text-sm sm:text-base border-white/15 focus:border-[#E0C88B] rounded-2xl placeholder:text-slate-400 font-sans shadow-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategoryTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#E0C88B] text-[#060F10] font-bold shadow-[0_0_15px_rgba(224,200,139,0.4)] scale-105"
                        : "glass-panel-dark text-slate-300 hover:text-white border border-white/10 hover:border-[#E0C88B]/40"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Matching Result Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-2 pt-1 border-t border-white/05">
              <span>
                Showing <strong className="text-[#E0C88B]">{totalMatchingItems}</strong> facility units
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
              <span className="hidden sm:inline-block text-slate-500">
                Click any facility card for diagnostic symptoms & 1-tap pre-fill
              </span>
            </div>
          </div>
        </section>

        {/* Categories & Items Grid */}
        <section className="py-12">
          <div className="container mx-auto px-6 max-w-7xl">
            {filteredData.length === 0 ? (
              <div className="text-center py-20 glass-panel-dark rounded-3xl border border-white/10 p-12 max-w-xl mx-auto">
                <Search className="w-12 h-12 text-[#E0C88B] mx-auto mb-4 opacity-60" />
                <h3 className="text-xl font-bold text-white mb-2 font-display">No matching facilities found</h3>
                <p className="text-sm text-slate-400 mb-6 font-sans">
                  We couldn't find any unit matching "{searchQuery}". Try searching for broader terms like "lighting", "water", "cable", or "AC".
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategoryTab("all");
                  }}
                  className="glass-panel text-[#E0C88B] border-[#E0C88B]/40"
                >
                  Reset Search Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-20">
                {filteredData.map((category) => (
                  <div key={category.id} id={category.id} className="scroll-mt-36">
                    {/* Category Header Banner */}
                    <div className="relative h-48 sm:h-56 rounded-3xl overflow-hidden mb-8 border border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(224,200,139,0.15)] group">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#060F10]/95 via-[#0C1B1C]/85 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060F10] via-transparent to-transparent" />

                      <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
                        <div className="flex items-center gap-4 sm:gap-5">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#E0C88B]/30 to-[#164340]/80 backdrop-blur-md flex items-center justify-center border border-[#E0C88B]/40 shadow-[0_0_20px_rgba(224,200,139,0.3)] shrink-0">
                            <category.icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#E0C88B]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#E0C88B]/15 text-[#E0C88B] border border-[#E0C88B]/30 font-mono">
                                {category.badge}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {category.items.length} Essential Units
                              </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                              {category.title}
                            </h2>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          asChild
                          className="bg-white/10 hover:bg-[#E0C88B]/20 text-[#EDE3CC] hover:text-white border border-white/20 hover:border-[#E0C88B]/60 backdrop-blur-md text-xs font-semibold rounded-xl self-start md:self-auto"
                        >
                          <Link to={`/register-complaint?category=${encodeURIComponent(category.title)}`}>
                            Report in {category.title.split(" ")[0]}
                            <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#E0C88B]" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Grid of Interactive Facility Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.items.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedItem({ item, category })}
                          className="group relative h-56 rounded-2xl overflow-hidden glass-panel-dark border border-white/15 hover:border-[#E0C88B]/60 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(224,200,139,0.25)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                        >
                          {/* Image background with gradient overlay */}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500 ease-out"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#060F10] via-[#060F10]/70 to-transparent" />

                          {/* Top Badges */}
                          <div className="relative p-4 flex items-center justify-between z-10">
                            <div className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center group-hover:border-[#E0C88B] group-hover:scale-110 transition-all duration-300">
                              <item.icon className="w-5 h-5 text-[#E0C88B]" />
                            </div>

                            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#E0C88B] border border-[#E0C88B]/30 font-bold">
                              SLA: {item.sla}
                            </span>
                          </div>

                          {/* Bottom Content & Action Trigger */}
                          <div className="relative p-4 z-10 space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-gradient-gold transition-colors font-display">
                                {item.name}
                              </h3>
                              <ArrowRight className="w-4 h-4 text-[#E0C88B] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>

                            <p className="text-xs text-slate-300 line-clamp-1 font-sans">
                              {item.desc}
                            </p>

                            <div className="flex items-center gap-1.5 pt-2 text-[11px] text-[#E0C88B]/80 font-mono">
                              <Sparkles className="w-3 h-3 text-[#E0C88B]" />
                              <span>Click to inspect & 1-tap dispatch</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Campus Maintenance Hotline Drawer Banner */}
        <section className="py-12">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="glass-panel-dark rounded-3xl p-8 border border-white/15 dark:border-[#E0C88B]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E0C88B]/20 text-[#E0C88B] flex items-center justify-center shrink-0 border border-[#E0C88B]/40 shadow-[0_0_20px_rgba(224,200,139,0.3)]">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Campus Emergency Maintenance Hotline
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    For active floods, short circuits, or gas smells — contact University Cell directly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-stretch md:self-auto justify-end">
                <a
                  href="tel:+919972623969"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#EDE3CC] font-mono text-sm font-bold border border-white/20 transition-colors flex items-center gap-2"
                >
                  <span>+91 99726239369</span>
                </a>
                <Button
                  asChild
                  className="bg-[#E0C88B] text-[#060F10] hover:bg-[#F3E5AB] font-bold px-6 py-3 h-auto rounded-xl"
                >
                  <Link to="/register-complaint">
                    Emergency Ticket <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Facility Inspection Modal */}
      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border border-[#E0C88B]/30 bg-[#070D0E]/95 backdrop-blur-2xl text-foreground shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(224,200,139,0.2)]">
          {selectedItem && (
            <div>
              {/* Modal Header Image */}
              <div className="relative h-48 overflow-hidden bg-black/60">
                <img
                  src={selectedItem.item.image}
                  alt={selectedItem.item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070D0E] via-[#070D0E]/60 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-black/70 text-[#E0C88B] border border-[#E0C88B]/30 backdrop-blur-md">
                    {selectedItem.category.title}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                      {selectedItem.item.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-sans mt-0.5">
                      {selectedItem.item.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* SLA and Status Pill Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Target Resolution SLA
                    </span>
                    <span className="text-sm font-bold text-[#E0C88B] font-mono mt-0.5 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedItem.item.sla}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Scheduled Maintenance
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Inspection
                    </span>
                  </div>
                </div>

                {/* Common Reported Symptoms & Faults */}
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Common Symptoms for this Unit
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedItem.item.symptoms.map((symptom, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/05 text-xs text-slate-300 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E0C88B]" />
                        <span>{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    onClick={() => {
                      const name = selectedItem.item.name;
                      const cat = selectedItem.category.title;
                      setSelectedItem(null);
                      handleLaunchTicket(name, cat);
                    }}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] font-bold text-sm shadow-[0_0_25px_rgba(224,200,139,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Launch Pre-Filled Ticket for {selectedItem.item.name.split(" ")[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedItem(null)}
                    className="h-12 px-5 text-slate-400 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Maintenance;
