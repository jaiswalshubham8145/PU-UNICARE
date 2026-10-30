import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Zap,
  ArrowRight,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Droplets,
  Wind,
  Lightbulb,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveTiltCard } from "@/components/ui/InteractiveTiltCard";

interface AssetOption {
  id: string;
  name: string;
  icon: any;
  category: string;
  symptoms: {
    label: string;
    probableCause: string;
    priority: "Critical" | "High" | "Medium" | "Low";
    priorityColor: string;
    estimatedSLA: string;
    technicianType: string;
    recommendation: string;
  }[];
}

const diagnosticAssets: AssetOption[] = [
  {
    id: "ac",
    name: "Air Conditioner (HVAC)",
    icon: Wind,
    category: "Air Conditioning",
    symptoms: [
      {
        label: "Warm air blowing / No cooling",
        probableCause: "Compressor overload trip or refrigerant gas pressure loss.",
        priority: "High",
        priorityColor: "text-amber-400 bg-amber-500/10 border-amber-400/40",
        estimatedSLA: "2 to 4 Hours",
        technicianType: "Senior HVAC Technician",
        recommendation: "Technician will bring digital manifold gauge and spare capacitor to test unit.",
      },
      {
        label: "Water dripping inside classroom",
        probableCause: "Condensate drain pipe clogged with algae or dust build-up.",
        priority: "High",
        priorityColor: "text-amber-400 bg-amber-500/10 border-amber-400/40",
        estimatedSLA: "1 to 2 Hours",
        technicianType: "HVAC Maintenance Staff",
        recommendation: "Drain line will be flushed with nitrogen pump to prevent electrical short-circuit.",
      },
      {
        label: "Loud rattling / grinding noise",
        probableCause: "Blower fan motor bearing wear or foreign object in coil.",
        priority: "Medium",
        priorityColor: "text-cyan-400 bg-cyan-500/10 border-cyan-400/40",
        estimatedSLA: "4 to 6 Hours",
        technicianType: "HVAC Mechanical Team",
        recommendation: "Unit blower assembly will be lubricated or balanced on-site.",
      },
    ],
  },
  {
    id: "projector",
    name: "Projector & Smart Board",
    icon: Monitor,
    category: "Audio-Visual & IT",
    symptoms: [
      {
        label: "No HDMI signal / Blue screen",
        probableCause: "Wall-plate HDMI port damaged or video distribution splitter power cut.",
        priority: "High",
        priorityColor: "text-amber-400 bg-amber-500/10 border-amber-400/40",
        estimatedSLA: "45 Minutes",
        technicianType: "Campus IT / AV Specialist",
        recommendation: "Immediate tech dispatch with replacement 10m high-speed HDMI cable.",
      },
      {
        label: "Dim display / Lamp warning blinking",
        probableCause: "UHP projector lamp exceeded 3,000-hour rated lifespan.",
        priority: "Medium",
        priorityColor: "text-cyan-400 bg-cyan-500/10 border-cyan-400/40",
        estimatedSLA: "3 Hours",
        technicianType: "Classroom AV Support",
        recommendation: "Stocked replacement OEM lamp module allocated from central inventory.",
      },
      {
        label: "Touch screen stylus unresponsive",
        probableCause: "USB touch calibration driver desynced or sensor frame smudged.",
        priority: "Medium",
        priorityColor: "text-cyan-400 bg-cyan-500/10 border-cyan-400/40",
        estimatedSLA: "1 Hour",
        technicianType: "Hardware Support Engineer",
        recommendation: "Sensor alignment tool applied and optical touch grid cleaned.",
      },
    ],
  },
  {
    id: "water",
    name: "Water Cooler & Purifier",
    icon: Droplets,
    category: "Plumbing",
    symptoms: [
      {
        label: "Tap leaking / Water flooding floor",
        probableCause: "Push-valve ceramic washer split or pipe joint fitting loose.",
        priority: "Critical",
        priorityColor: "text-rose-400 bg-rose-500/10 border-rose-400/40",
        estimatedSLA: "30 to 45 Minutes",
        technicianType: "Emergency Plumbing Crew",
        recommendation: "Rapid shutoff isolation; replace brass spring push-tap immediately to stop floor hazard.",
      },
      {
        label: "Water not cooling (room temp)",
        probableCause: "Thermostat switch tripped or cooling coil condenser fan blocked.",
        priority: "Medium",
        priorityColor: "text-cyan-400 bg-cyan-500/10 border-cyan-400/40",
        estimatedSLA: "2 to 3 Hours",
        technicianType: "Plumbing & Refrigeration Staff",
        recommendation: "Thermostat re-calibrated and cooling coil condenser vacuumed.",
      },
      {
        label: "Low water flow / Filter choked",
        probableCause: "Sediment and carbon pre-filter cartridge saturated.",
        priority: "Low",
        priorityColor: "text-slate-400 bg-slate-500/10 border-slate-400/40",
        estimatedSLA: "6 Hours",
        technicianType: "Water Treatment Technician",
        recommendation: "Dual 10-inch spun PP sediment filter replaced and TDS checked.",
      },
    ],
  },
  {
    id: "electrical",
    name: "Lighting & Power Sockets",
    icon: Lightbulb,
    category: "Electrical",
    symptoms: [
      {
        label: "Sparking / Burnt smell from socket",
        probableCause: "Internal loose terminal contact causing thermal arcing hazard.",
        priority: "Critical",
        priorityColor: "text-rose-400 bg-rose-500/10 border-rose-400/40",
        estimatedSLA: "20 Minutes (Hazard)",
        technicianType: "Licensed Electrical Lineman",
        recommendation: "Emergency circuit breaker trip; replace modular switchplate with fire-retardant socket.",
      },
      {
        label: "Multiple tube lights flickering",
        probableCause: "Electronic ballast capacitor failure or neutral wire voltage fluctuation.",
        priority: "Medium",
        priorityColor: "text-cyan-400 bg-cyan-500/10 border-cyan-400/40",
        estimatedSLA: "2 Hours",
        technicianType: "Campus Electrician",
        recommendation: "Retrofit with direct-drive energy-efficient 20W LED batten fixture.",
      },
    ],
  },
];

export function DiagnosticSimulator() {
  const [selectedAssetId, setSelectedAssetId] = useState<string>("ac");
  const [selectedSymptomIdx, setSelectedSymptomIdx] = useState<number>(0);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const navigate = useNavigate();

  const currentAsset =
    diagnosticAssets.find((a) => a.id === selectedAssetId) ||
    diagnosticAssets[0];

  const currentSymptom = currentAsset.symptoms[selectedSymptomIdx] || currentAsset.symptoms[0];

  const handleAssetChange = (assetId: string) => {
    setIsDiagnosing(true);
    setSelectedAssetId(assetId);
    setSelectedSymptomIdx(0);
    setTimeout(() => setIsDiagnosing(false), 250);
  };

  const handleSymptomChange = (idx: number) => {
    setIsDiagnosing(true);
    setSelectedSymptomIdx(idx);
    setTimeout(() => setIsDiagnosing(false), 200);
  };

  const handleProceedToReport = () => {
    navigate(
      `/register-complaint?category=${encodeURIComponent(
        currentAsset.category
      )}&title=${encodeURIComponent(
        `${currentAsset.name} — ${currentSymptom.label}`
      )}&priority=${currentSymptom.priority.toLowerCase()}`
    );
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background radial aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#E0C88B]/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0C88B]/10 border border-[#E0C88B]/40 shadow-[0_0_20px_rgba(224,200,139,0.2)] mb-4">
            <Brain className="w-4 h-4 text-[#E0C88B] animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E0C88B]">
              Interactive AI Diagnostic Sandbox
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Test Our <span className="text-gradient-gold font-extrabold">Instant AI Diagnosis</span>
          </h2>
          <p className="text-base text-slate-300">
            Click any campus asset below to simulate how our Gemini AI models analyze symptoms, predict causes, and calculate resolution SLAs before you even report.
          </p>
        </div>

        {/* Asset Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {diagnosticAssets.map((asset) => {
            const isSelected = asset.id === selectedAssetId;
            const AssetIcon = asset.icon;

            return (
              <button
                key={asset.id}
                onClick={() => handleAssetChange(asset.id)}
                className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-left ${
                  isSelected
                    ? "bg-[#E0C88B]/15 border-[#E0C88B]/70 text-white shadow-[0_0_25px_rgba(224,200,139,0.3)] scale-[1.02]"
                    : "bg-[#091113]/80 border-white/10 text-slate-400 hover:text-white hover:border-[#E0C88B]/30 hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-gradient-to-br from-[#E0C88B] to-[#C2A05A] text-[#060B0D] shadow-[0_0_14px_rgba(224,200,139,0.6)] font-bold"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  <AssetIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">
                    {asset.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {asset.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Diagnosis Card */}
        <InteractiveTiltCard
          maxTilt={4}
          glowColor="rgba(224, 200, 139, 0.2)"
          className="border border-white/10 bg-[#070D0E]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_35px_rgba(224,200,139,0.1)]"
        >
          <div className="p-6 md:p-8">
            {/* Step 1: Select Symptom */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E0C88B]" />
                <span>Step 1: Choose a simulated symptom</span>
              </label>

              <div className="flex flex-wrap gap-2.5">
                {currentAsset.symptoms.map((symptom, idx) => {
                  const isActive = idx === selectedSymptomIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSymptomChange(idx)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] text-[#060B0D] border-transparent font-extrabold shadow-[0_0_15px_rgba(224,200,139,0.4)]"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {symptom.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Live AI Generated Diagnosis */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedAssetId}-${selectedSymptomIdx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-emerald-950/25 rounded-2xl border border-emerald-500/25 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Gemini 1.5 Flash Real-Time Triage
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-white mt-1">
                      {currentAsset.name}: {currentSymptom.label}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${currentSymptom.priorityColor}`}
                    >
                      Priority: {currentSymptom.priority}
                    </span>
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
                  <div className="bg-[#050D0E]/80 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Probable Root Cause
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {currentSymptom.probableCause}
                    </p>
                  </div>

                  <div className="bg-[#050D0E]/80 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Target SLA Resolution
                    </div>
                    <p className="text-base font-extrabold text-white">
                      {currentSymptom.estimatedSLA}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Guaranteed institutional response
                    </p>
                  </div>

                  <div className="bg-[#050D0E]/80 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                      Assigned Crew
                    </div>
                    <p className="text-xs text-white font-bold">
                      {currentSymptom.technicianType}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Equipped with parts inventory
                    </p>
                  </div>
                </div>

                {/* Recommendation & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-emerald-500/20">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{currentSymptom.recommendation}</span>
                  </div>

                  <Button
                    onClick={handleProceedToReport}
                    className="bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] text-[#060F10] hover:scale-105 font-bold shadow-[0_0_20px_rgba(224,200,139,0.5)] transition-all shrink-0 rounded-xl"
                  >
                    <span>Report This Issue Now</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </InteractiveTiltCard>
      </div>
    </section>
  );
}

export default DiagnosticSimulator;
