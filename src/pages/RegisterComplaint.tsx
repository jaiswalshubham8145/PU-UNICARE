import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  AlertTriangle,
  MapPin,
  Building2,
  Tag,
  X,
  Loader2,
  QrCode,
  Mic,
  Camera as CameraIcon,
  Sparkles,
  CheckCircle2,
  Flame,
  Zap,
  Clock,
  ShieldCheck,
  Radio,
  Image as ImageIcon,
  ArrowRight,
  Info,
  Compass,
  Globe,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments, useCategories, useBuildings, useComplaints } from "@/hooks/useComplaints";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { ALLOWED_ROLES_FOR_COMPLAINTS, BUCKETS } from "@/config/constants";
import SmartCategoryDetector from "@/components/complaints/SmartCategoryDetector";
import { analyzeComplaint } from "@/services/AIService";
import { QRScanner } from "@/components/complaints/QRScanner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fireCelebrationConfetti } from "@/utils/confetti";

type ComplaintPriority = Database['public']['Enums']['complaint_priority'];

interface PriorityOption {
  value: ComplaintPriority;
  label: string;
  sla: string;
  icon: typeof Flame;
  color: string;
  glow: string;
  borderActive: string;
  bgActive: string;
  desc: string;
}

const priorityCards: PriorityOption[] = [
  {
    value: "critical",
    label: "Critical",
    sla: "< 2 Hours SLA",
    icon: Flame,
    color: "text-rose-400",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.35)]",
    borderActive: "border-rose-500",
    bgActive: "bg-rose-500/10",
    desc: "Immediate hazard or total facility shutdown",
  },
  {
    value: "high",
    label: "High",
    sla: "< 6 Hours SLA",
    icon: Zap,
    color: "text-amber-400",
    glow: "shadow-[0_0_25px_rgba(251,191,36,0.35)]",
    borderActive: "border-amber-500",
    bgActive: "bg-amber-500/10",
    desc: "Urgent issue affecting regular classroom / lab operations",
  },
  {
    value: "medium",
    label: "Medium",
    sla: "< 24 Hours SLA",
    icon: Clock,
    color: "text-emerald-400",
    glow: "shadow-[0_0_25px_rgba(52,211,153,0.35)]",
    borderActive: "border-emerald-500",
    bgActive: "bg-emerald-500/10",
    desc: "Standard maintenance or minor equipment malfunction",
  },
  {
    value: "low",
    label: "Low",
    sla: "< 48 Hours SLA",
    icon: ShieldCheck,
    color: "text-sky-400",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.35)]",
    borderActive: "border-sky-500",
    bgActive: "bg-sky-500/10",
    desc: "Routine inspection, minor aesthetic fix, or general inquiry",
  },
];

// Quick category shortcuts for fast 1-tap selection
const quickCategories = [
  { label: "Electrical", icon: "⚡", keyword: "electric" },
  { label: "Plumbing", icon: "🚰", keyword: "plumb" },
  { label: "AC & HVAC", icon: "❄️", keyword: "ac" },
  { label: "Carpentry", icon: "🪚", keyword: "carpent" },
  { label: "IT & AV", icon: "🖥️", keyword: "it" },
  { label: "Cleaning", icon: "🧹", keyword: "clean" },
];

const formSchema = z.object({
  title: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  building: z.string().min(1, "Building is required"),
  location: z.string().min(1, "Specific location is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["critical", "high", "medium", "low"] as const, {
    required_error: "Priority is required",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const RegisterComplaint = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeLocation = useLocation();
  const { user, roles } = useAuth();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: buildings, isLoading: loadingBuildings } = useBuildings();
  const { submitComplaint } = useComplaints();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; name: string; size: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // States
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const [isRecording, setIsRecording] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<"auto" | "gu-IN" | "hi-IN" | "en-IN">("auto");
  const recognitionRef = useRef<any>(null);

  // Capture Geolocation on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.log("GPS Geolocation notice:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      department: "",
      building: "",
      location: "",
      category: "",
      priority: undefined,
      description: "",
    },
  });

  // Pre-fill fields from URL query params (e.g. from Maintenance catalog)
  useEffect(() => {
    const titleParam = searchParams.get("title");
    const categoryParam = searchParams.get("category");
    const priorityParam = searchParams.get("priority");

    if (titleParam) {
      form.setValue("title", titleParam, { shouldValidate: true });
    }

    if (categoryParam && categories && categories.length > 0) {
      const matched = categories.find(
        (c) =>
          c.id === categoryParam ||
          c.name.toLowerCase().includes(categoryParam.toLowerCase()) ||
          categoryParam.toLowerCase().includes(c.name.toLowerCase())
      );
      if (matched) {
        form.setValue("category", matched.id, { shouldValidate: true });
      }
    }

    if (priorityParam && ["critical", "high", "medium", "low"].includes(priorityParam)) {
      form.setValue("priority", priorityParam as "critical" | "high" | "medium" | "low", {
        shouldValidate: true,
      });
    }
  }, [searchParams, categories, form]);

  // ─── Pre-fill from AI Voice/Chatbot Assistant Payload ─────────
  useEffect(() => {
    const state = routeLocation.state as { aiAssistantPayload?: {
      departmentId?: string;
      buildingId?: string;
      categoryId?: string;
      location?: string;
      priority?: string;
      title?: string;
      description?: string;
    } } | null;

    const ai = state?.aiAssistantPayload;
    if (!ai) return;

    let filledCount = 0;

    if (ai.departmentId && departments?.some(d => d.id === ai.departmentId)) {
      form.setValue("department", ai.departmentId, { shouldValidate: true });
      filledCount++;
    }
    if (ai.buildingId && buildings?.some(b => b.id === ai.buildingId)) {
      form.setValue("building", ai.buildingId, { shouldValidate: true });
      filledCount++;
    }
    if (ai.categoryId && categories?.some(c => c.id === ai.categoryId)) {
      form.setValue("category", ai.categoryId, { shouldValidate: true });
      filledCount++;
    }
    if (ai.location) {
      form.setValue("location", ai.location, { shouldValidate: true });
      filledCount++;
    }
    if (ai.priority && ["critical", "high", "medium", "low"].includes(ai.priority)) {
      form.setValue("priority", ai.priority as "critical" | "high" | "medium" | "low", { shouldValidate: true });
      filledCount++;
    }
    if (ai.title) {
      form.setValue("title", ai.title, { shouldValidate: true });
      filledCount++;
    }
    if (ai.description) {
      form.setValue("description", ai.description, { shouldValidate: true });
      filledCount++;
    }

    if (filledCount > 0) {
      toast.success(`✨ AI Assistant auto-filled ${filledCount} fields!`, {
        description: "Review the details below, attach photo evidence, and submit.",
        duration: 6000,
      });
    }

    // Clear the navigation state so it doesn't re-trigger on refresh
    window.history.replaceState({}, document.title);
  }, [routeLocation.state, departments, buildings, categories, form]);

  // Watch form fields for live Hologram Ticket Preview and Readiness Score
  const watchedDepartment = form.watch("department");
  const watchedBuilding = form.watch("building");
  const watchedLocation = form.watch("location");
  const watchedCategory = form.watch("category");
  const watchedPriority = form.watch("priority");
  const watchedDescription = form.watch("description");
  const watchedTitle = form.watch("title");

  // Generate File Previews
  useEffect(() => {
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setFilePreviews(previews);

    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValid) toast.error(`${file.name} exceeds 10MB limit`);
      return isValid;
    });
    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    const validFiles = droppedFiles.filter(file => {
      const isValid = file.size <= 10 * 1024 * 1024;
      if (!isValid) toast.error(`${file.name} exceeds 10MB limit`);
      return isValid;
    });
    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (!user || files.length === 0) return [];

    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(BUCKETS.COMPLAINT_IMAGES)
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKETS.COMPLAINT_IMAGES)
        .getPublicUrl(fileName);

      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  // QR Scan Handling
  const handleQRScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.building) {
        const match = buildings?.find(b => b.id === data.building || b.name.toLowerCase() === data.building.toLowerCase());
        if (match) form.setValue("building", match.id, { shouldValidate: true });
      }
      if (data.department) {
        const match = departments?.find(d => d.id === data.department || d.name.toLowerCase() === data.department.toLowerCase());
        if (match) form.setValue("department", match.id, { shouldValidate: true });
      }
      if (data.category) {
        const match = categories?.find(c => c.id === data.category || c.name.toLowerCase() === data.category.toLowerCase());
        if (match) form.setValue("category", match.id, { shouldValidate: true });
      }
      if (data.location) {
        form.setValue("location", data.location, { shouldValidate: true });
      }
      toast.success("Asset details populated from QR code!");
      setShowQRScanner(false);
    } catch {
      toast.error("Invalid QR Code format. Please scan an authorized PU asset tag.");
    }
  };

  // Auto-fill extracted dossier points from speech transcript
  const autoFillPointsFromTranscript = (transcript: string) => {
    const analysis = analyzeComplaint(transcript);
    let autoFilledCount = 0;

    // 1. Auto-fill Category if detected and not already chosen
    if (analysis.categories.length > 0 && categories && categories.length > 0) {
      const bestCat = analysis.categories[0].category;
      const matched = categories.find(
        (c) =>
          c.name.toLowerCase().includes(bestCat.replace("_", " ")) ||
          bestCat.includes(c.name.toLowerCase().replace(" ", "_"))
      );
      if (matched) {
        form.setValue("category", matched.id, { shouldValidate: true });
        autoFilledCount++;
      }
    }

    // 2. Auto-fill Priority if detected (especially critical / high urgency)
    if (analysis.priority && analysis.priority.score >= 50) {
      form.setValue("priority", analysis.priority.priority, { shouldValidate: true });
      autoFilledCount++;
    }

    // 3. Auto-fill Location if specific room/lab/floor mentioned
    if (analysis.extractedLocation && !form.getValues("location")) {
      form.setValue("location", analysis.extractedLocation, { shouldValidate: true });
      autoFilledCount++;
    }

    // 4. Auto-fill Title if empty
    if (!form.getValues("title") && analysis.suggestedTitle) {
      form.setValue("title", analysis.suggestedTitle, { shouldValidate: true });
      autoFilledCount++;
    }

    if (autoFilledCount > 0) {
      toast.success(`✨ AI auto-extracted ${autoFilledCount} key points from your speech!`, {
        description: `Category, urgency, and location populated automatically.`,
      });
    }
  };

  // Multilingual Speech Recognition Dictator (Auto / Gujarati / Hindi / English)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // If already recording, stop it
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;

    // Language selection: "auto" utilizes en-IN (which natively accepts Indian English, Hinglish & transliterations)
    // or explicit dialects when chosen
    const selectedLang = speechLanguage === "auto" ? "en-IN" : speechLanguage;
    recognition.lang = selectedLang;

    recognition.onstart = () => {
      setIsRecording(true);
      const langNotice = speechLanguage === "auto" 
        ? "Listening... Speak in Hindi, Gujarati, English, or mixed!"
        : speechLanguage === "gu-IN" 
          ? "સાંભળી રહ્યું છે... ગુજરાતીમાં બોલો."
          : speechLanguage === "hi-IN"
            ? "सुन रहा हूँ... हिन्दी में बोलें।"
            : "Listening in English...";
      toast(langNotice);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        toast.error("Microphone access denied. Please grant microphone permissions.");
      } else if (event.error === 'no-speech') {
        toast.error("No speech detected. Please speak closer to the microphone.");
      } else {
        toast.error(`Voice input error: ${event.error}`);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentDescription = form.getValues("description") || "";
      const updatedDescription = currentDescription ? `${currentDescription} ${transcript}` : transcript;
      
      form.setValue("description", updatedDescription, {
        shouldValidate: true,
      });

      // Automatically extract key points and auto-fill form fields!
      autoFillPointsFromTranscript(updatedDescription);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecording(false);
    }
  };

  // Form Readiness Score Calculation (0% - 100%)
  const readiness = useMemo(() => {
    let score = 0;
    const items: { label: string; done: boolean }[] = [];

    const hasDept = Boolean(watchedDepartment);
    const hasBuildingLoc = Boolean(watchedBuilding && watchedLocation);
    const hasCategory = Boolean(watchedCategory);
    const hasPriority = Boolean(watchedPriority);
    const hasDesc = (watchedDescription?.length || 0) >= 10;
    const hasEvidence = files.length > 0;

    if (hasDept) score += 15;
    items.push({ label: "Department Selected", done: hasDept });

    if (hasBuildingLoc) score += 20;
    items.push({ label: "Building & Room Specified", done: hasBuildingLoc });

    if (hasCategory) score += 15;
    items.push({ label: "Category Assigned", done: hasCategory });

    if (hasPriority) score += 15;
    items.push({ label: "Priority Level Chosen", done: hasPriority });

    if (hasDesc) score += 20;
    items.push({ label: "Detailed Description (10+ chars)", done: hasDesc });

    if (hasEvidence) score += 15;
    items.push({ label: "Photo / Video Evidence Attached", done: hasEvidence });

    return { score, items, isReady: score === 100 };
  }, [watchedDepartment, watchedBuilding, watchedLocation, watchedCategory, watchedPriority, watchedDescription, files]);

  // Selected entities for Live Ticket Preview
  const selectedDeptObj = departments?.find(d => d.id === watchedDepartment);
  const selectedBuildingObj = buildings?.find(b => b.id === watchedBuilding);
  const selectedCategoryObj = categories?.find(c => c.id === watchedCategory);
  const selectedPriorityObj = priorityCards.find(p => p.value === watchedPriority);

  // Group campus buildings by verified category
  const groupedBuildings = useMemo(() => {
    if (!buildings) return {};
    const groups: Record<string, typeof buildings> = {};
    for (const b of buildings) {
      const cat = b.category || 'General Campus';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(b);
    }
    return groups;
  }, [buildings]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("Please login to submit a complaint");
      navigate("/login");
      return;
    }

    if (files.length === 0) {
      toast.error("Photo/Video evidence is mandatory for verification.");
      return;
    }

    if (!roles.some(role => ALLOWED_ROLES_FOR_COMPLAINTS.includes(role))) {
      toast.error("Access Restricted", {
        description: "Your user role is not permitted to register tickets. Contact campus admin.",
      });
      return;
    }

    setUploading(true);

    try {
      const imageUrls = await uploadFiles();

      const result = await submitComplaint.mutateAsync({
        title: values.title || `${selectedCategoryObj?.name || 'Maintenance'} Issue`,
        description: values.description,
        location: values.location,
        department_id: values.department,
        category_id: values.category,
        priority: values.priority,
        building_id: values.building,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      // Fire celebratory confetti!
      fireCelebrationConfetti();

      toast.success("Complaint Registered Successfully!", {
        description: `Ticket #${result.complaint_number} is now active and tracked in real-time.`,
      });

      setTimeout(() => {
        navigate("/track", { state: { complaintNumber: result.complaint_number } });
      }, 900);
    } catch (error: unknown) {
      console.error("Submit error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Submission Failed", { description: message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060F10] text-foreground selection:bg-[#E0C88B]/30 selection:text-[#F7F2E7] overflow-x-hidden">
      <Navbar />

      {/* Luxury Ambient Light Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#E0C88B]/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[420px] h-[420px] bg-sky-500/08 rounded-full blur-[130px]" />
      </div>

      <main className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

          {/* Top Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 glass-panel px-5 py-2 rounded-full mb-6 border-[#E0C88B]/40 bg-[#E0C88B]/10 shadow-[0_0_20px_rgba(224,200,139,0.2)]">
              <Sparkles className="w-4 h-4 text-[#E0C88B]" />
              <span className="text-[#F7F2E7] font-semibold text-xs tracking-[0.25em] uppercase font-mono">
                Smart Dispatch Studio
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-black mb-4 tracking-tight">
              <span className="text-gradient-royal">Register Maintenance</span>{" "}
              <span className="text-gradient-gold block md:inline mt-1">
                <span className="italic-editorial font-normal">Fast</span> Ticket
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
              Submit campus issues with AI diagnostic assistance, live GPS anchoring, and automated SLA resolution tracking.
            </p>

            {/* Quick QR Scanner Hero Banner */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="group relative inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl glass-panel-dark border border-[#E0C88B]/40 hover:border-[#E0C88B] transition-all duration-300 hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(224,200,139,0.15)] hover:shadow-[0_10px_40px_rgba(224,200,139,0.3)] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2A05A] to-[#E0C88B] flex items-center justify-center text-[#060F10] shadow-[0_0_15px_rgba(224,200,139,0.5)] group-hover:rotate-12 transition-transform duration-300">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#F7F2E7] flex items-center gap-1.5">
                    Scan Asset QR Tag
                    <span className="text-[10px] font-mono uppercase bg-[#E0C88B]/20 text-[#E0C88B] px-2 py-0.5 rounded-full border border-[#E0C88B]/30">
                      1-Tap Auto Fill
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Instantly load building, classroom, and equipment metadata
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#E0C88B] ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Form Readiness & GPS Pill Bar */}
          <div className="glass-panel-dark rounded-2xl p-4 mb-8 border border-white/10 dark:border-[#E0C88B]/25 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#E0C88B"
                    strokeWidth="3.5"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * readiness.score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold text-[#E0C88B]">
                  {readiness.score}%
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-foreground flex items-center gap-2">
                  Form Readiness Indicator
                  {readiness.isReady ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Ready to Dispatch
                    </span>
                  ) : (
                    <span className="text-xs text-amber-300/80 font-normal">
                      Complete remaining required fields
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-mono">
                  {readiness.items.filter(i => i.done).length} of {readiness.items.length} requirements fulfilled
                </div>
              </div>
            </div>

            {/* GPS Pill */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs">
              <Compass className={`w-4 h-4 ${coords.latitude ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <div>
                <span className="font-semibold text-slate-200">
                  {coords.latitude ? "GPS Anchor Active" : "GPS Triangulating..."}
                </span>
                <span className="block text-[10px] font-mono text-slate-400">
                  {coords.latitude
                    ? `${coords.latitude.toFixed(4)}° N, ${coords.longitude?.toFixed(4)}° E (Vadodara)`
                    : "Acquiring campus satellite lock"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left / Main Interactive Form (Cols 1-7) */}
            <div className="lg:col-span-7 space-y-6">
              {!user && (
                <div className="glass-panel-dark border-amber-500/30 bg-amber-500/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-200">
                      You are currently browsing as a guest. Please sign in to submit complaints.
                    </p>
                  </div>
                  <Button size="sm" asChild className="bg-[#E0C88B] text-[#060F10] hover:bg-[#F3E5AB] font-bold">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* Step 1: Location & Department */}
                  <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 dark:border-[#E0C88B]/25 space-y-5 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E0C88B]/20 text-[#E0C88B] flex items-center justify-center font-mono font-bold text-sm border border-[#E0C88B]/30">
                          01
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-foreground font-display">Campus Location & Jurisdiction</h2>
                          <p className="text-xs text-muted-foreground">Select where the maintenance is required</p>
                        </div>
                      </div>
                      <Building2 className="w-5 h-5 text-[#E0C88B]/60" />
                    </div>

                    {/* Department & Building Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-slate-300">
                              Academic / Admin Dept *
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={loadingDepts}>
                              <FormControl>
                                <SelectTrigger className="glass-input h-11 border-white/15 focus:border-[#E0C88B]">
                                  <SelectValue placeholder={loadingDepts ? "Loading depts..." : "Select department"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="glass-panel-dark border-white/15">
                                {departments?.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id} className="cursor-pointer pl-6 text-xs sm:text-sm py-2 text-slate-100 hover:text-white focus:bg-[#E0C88B] focus:text-[#0a1120] font-medium">
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="building"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-slate-300">
                              Campus Building / Food Court / Facility *
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={loadingBuildings}>
                              <FormControl>
                                <SelectTrigger className="glass-input h-11 border-white/15 focus:border-[#E0C88B]">
                                  <SelectValue placeholder={loadingBuildings ? "Loading campus buildings..." : "Select building or food court"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="glass-panel-dark border-white/15 max-h-80 overflow-y-auto">
                                {Object.entries(groupedBuildings).map(([catName, list]) => (
                                  <SelectGroup key={catName}>
                                    <SelectLabel className="text-[#E0C88B] text-[11px] font-bold px-3 py-1.5 uppercase tracking-wider bg-white/5 border-y border-white/10 mt-1 sticky top-0 backdrop-blur-md z-10">
                                      {catName}
                                    </SelectLabel>
                                    {list.map((building) => (
                                      <SelectItem key={building.id} value={building.id} className="cursor-pointer pl-6 text-xs sm:text-sm py-2 text-slate-100 hover:text-white focus:bg-[#E0C88B] focus:text-[#0a1120] font-medium">
                                        {building.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                ))}
                              </SelectContent>
                            </Select>

                            {selectedBuildingObj && (
                              <div className="mt-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-between text-slate-300 animate-fadeIn">
                                <div className="flex items-center gap-2 truncate">
                                  <Building2 className="w-3.5 h-3.5 text-[#E0C88B] shrink-0" />
                                  <span className="truncate font-medium text-white">{selectedBuildingObj.name}</span>
                                </div>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#E0C88B]/15 text-[#E0C88B] border border-[#E0C88B]/30 shrink-0 ml-2">
                                  {selectedBuildingObj.category}
                                </span>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Specific Location Input */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span>Exact Location / Room *</span>
                            <span className="text-[10px] text-muted-foreground font-mono">e.g. Lab 402, Block B, Floor 4</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-[#E0C88B]" />
                              <Input
                                placeholder="Specify room, floor, or landmark"
                                {...field}
                                className="glass-input pl-9 h-11 border-white/15 focus:border-[#E0C88B]"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 2: Issue Classification & Priority */}
                  <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 dark:border-[#E0C88B]/25 space-y-5 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E0C88B]/20 text-[#E0C88B] flex items-center justify-center font-mono font-bold text-sm border border-[#E0C88B]/30">
                          02
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-foreground font-display">Classification & SLA Priority</h2>
                          <p className="text-xs text-muted-foreground">Select category and urgency level</p>
                        </div>
                      </div>
                      <Tag className="w-5 h-5 text-[#E0C88B]/60" />
                    </div>

                    {/* Quick Category Chips */}
                    <div>
                      <Label className="text-xs font-semibold text-slate-300 block mb-2">
                        Quick Category Shortcuts (1-Tap Selection)
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {quickCategories.map((chip, i) => {
                          const matchedCategory = categories?.find(c =>
                            c.name.toLowerCase().includes(chip.keyword)
                          );
                          const isSelected = matchedCategory && form.watch("category") === matchedCategory.id;

                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                if (matchedCategory) {
                                  form.setValue("category", matchedCategory.id, { shouldValidate: true });
                                  toast.success(`Selected category: ${matchedCategory.name}`);
                                } else {
                                  toast.info(`Please pick from the category dropdown below.`);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                                isSelected
                                  ? "bg-[#E0C88B]/25 text-[#E0C88B] border-[#E0C88B] shadow-[0_0_12px_rgba(224,200,139,0.3)] scale-105"
                                  : "glass-panel text-slate-300 hover:text-white border-white/10 hover:border-[#E0C88B]/40"
                              }`}
                            >
                              <span>{chip.icon}</span>
                              <span>{chip.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Select Dropdown */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-300">
                            Issue Category (Full Catalog) *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={loadingCats}>
                            <FormControl>
                              <SelectTrigger className="glass-input h-11 border-white/15 focus:border-[#E0C88B]">
                                <SelectValue placeholder={loadingCats ? "Loading categories..." : "Select category"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-panel-dark border-white/15">
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id} className="cursor-pointer pl-6 text-xs sm:text-sm py-2 text-slate-100 hover:text-white focus:bg-[#E0C88B] focus:text-[#0a1120] font-medium">
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Interactive Priority Selector Cards */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span>SLA Priority Level *</span>
                            <span className="text-[10px] text-muted-foreground font-mono">Select based on operational impact</span>
                          </FormLabel>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {priorityCards.map((p) => {
                              const isSelected = field.value === p.value;
                              const IconComponent = p.icon;

                              return (
                                <div
                                  key={p.value}
                                  onClick={() => field.onChange(p.value)}
                                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                    isSelected
                                      ? `${p.borderActive} ${p.bgActive} ${p.glow} scale-[1.02]`
                                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? p.color : 'text-slate-400'}`}>
                                        <IconComponent className="w-4 h-4" />
                                      </div>
                                      <span className="font-bold text-sm text-foreground">{p.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                                      isSelected
                                        ? "bg-white/15 text-white border-white/20"
                                        : "bg-white/5 text-slate-400 border-white/10"
                                    }`}>
                                      {p.sla}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400 line-clamp-2">
                                    {p.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 3: Description & AI Suggestions */}
                  <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 dark:border-[#E0C88B]/25 space-y-5 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E0C88B]/20 text-[#E0C88B] flex items-center justify-center font-mono font-bold text-sm border border-[#E0C88B]/30">
                          03
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-foreground font-display">Details & Voice Dictation</h2>
                          <p className="text-xs text-muted-foreground">Type or speak the problem</p>
                        </div>
                      </div>
                      <FileText className="w-5 h-5 text-[#E0C88B]/60" />
                    </div>

                    {/* Optional Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span>Issue Headline / Title (Optional)</span>
                            <span className="text-[10px] text-muted-foreground">Auto-generated if left empty</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. AC unit in Lab 402 leaking water onto floor"
                              {...field}
                              className="glass-input h-11 border-white/15 focus:border-[#E0C88B]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Detailed Description with Voice Dictation */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span>Issue Description *</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {(field.value?.length || 0)} / 10 min chars
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea
                                placeholder="Describe the malfunction, smell, sound, safety hazard, or maintenance request..."
                                rows={5}
                                {...field}
                                className="glass-input pr-14 min-h-[120px] resize-y border-white/15 focus:border-[#E0C88B]"
                              />

                              {/* Voice Dictation Button with animated soundwave & Multi-Language Selector */}
                              <div className="absolute right-3 bottom-3 flex items-center gap-1.5 flex-wrap justify-end">
                                {/* Language Mode Selector Pills */}
                                <div className="hidden sm:flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-1 rounded-xl border border-white/10 text-[10px]">
                                  <Globe className="w-3 h-3 text-[#E0C88B] mr-0.5" />
                                  {[
                                    { id: "auto", label: "Auto / Mix" },
                                    { id: "gu-IN", label: "ગુજરાતી" },
                                    { id: "hi-IN", label: "हिन्दी" },
                                    { id: "en-IN", label: "Eng" },
                                  ].map((l) => (
                                    <button
                                      key={l.id}
                                      type="button"
                                      onClick={() => setSpeechLanguage(l.id as any)}
                                      className={`px-1.5 py-0.5 rounded-md transition-all ${
                                        speechLanguage === l.id
                                          ? "bg-[#E0C88B] text-black font-extrabold shadow-sm"
                                          : "text-slate-400 hover:text-white"
                                      }`}
                                    >
                                      {l.label}
                                    </button>
                                  ))}
                                </div>

                                {isRecording && (
                                  <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-1 rounded-full border border-rose-500/40">
                                    <span className="w-1.5 h-3 bg-rose-400 rounded-full animate-pulse" />
                                    <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-2 bg-rose-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-mono font-bold text-rose-300 ml-1">Live</span>
                                  </div>
                                )}

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={toggleSpeechRecognition}
                                  className={`h-9 w-9 rounded-xl transition-all duration-300 ${
                                    isRecording
                                      ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse"
                                      : "bg-white/10 hover:bg-[#E0C88B]/20 text-slate-300 hover:text-[#E0C88B]"
                                  }`}
                                  title={`Click to dictate in ${speechLanguage === 'auto' ? 'Hindi / Gujarati / English mix' : speechLanguage}`}
                                >
                                  <Mic className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* AI Smart Category & Priority Suggestions */}
                    <SmartCategoryDetector
                      description={form.watch('description')}
                      onCategorySelect={(catId) => {
                        const category = categories?.find(c =>
                          c.name.toLowerCase().includes(catId.replace('_', ' ')) ||
                          catId.includes(c.name.toLowerCase().replace(' ', '_'))
                        );
                        if (category) {
                          form.setValue('category', category.id, { shouldValidate: true });
                          toast.success(`AI suggested category applied: ${category.name}`);
                        }
                      }}
                      onPrioritySelect={(priority) => {
                        form.setValue('priority', priority as "critical" | "high" | "medium" | "low", { shouldValidate: true });
                        toast.success(`AI priority applied: ${priority}`);
                      }}
                      onTitleSuggestion={(title) => {
                        form.setValue('title', title);
                      }}
                      onLocationDetected={(loc) => {
                        form.setValue('location', loc, { shouldValidate: true });
                        toast.success(`Location extracted from speech: ${loc}`);
                      }}
                    />
                  </div>

                  {/* Step 4: Evidence & Media Upload */}
                  <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 dark:border-[#E0C88B]/25 space-y-5 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E0C88B]/20 text-[#E0C88B] flex items-center justify-center font-mono font-bold text-sm border border-[#E0C88B]/30">
                          04
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-foreground font-display">Photo / Video Evidence Studio</h2>
                          <p className="text-xs text-muted-foreground">Mandatory visual proof for quick dispatch</p>
                        </div>
                      </div>
                      <Upload className="w-5 h-5 text-[#E0C88B]/60" />
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${
                        dragActive
                          ? "border-[#E0C88B] bg-[#E0C88B]/10 shadow-[0_0_25px_rgba(224,200,139,0.3)]"
                          : "border-white/15 bg-white/[0.02] hover:border-[#E0C88B]/50 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#E0C88B]/15 text-[#E0C88B] flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          Drag & drop photos/videos here, or choose an option
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          Supports PNG, JPG, MP4 up to 10MB each (Max 5 files)
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="glass-panel text-slate-200 hover:text-white border-white/20 hover:border-[#E0C88B]/60 rounded-xl"
                          >
                            <ImageIcon className="w-4 h-4 mr-2 text-[#E0C88B]" />
                            Browse Files
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => cameraInputRef.current?.click()}
                            className="glass-panel text-slate-200 hover:text-white border-white/20 hover:border-[#E0C88B]/60 rounded-xl"
                          >
                            <CameraIcon className="w-4 h-4 mr-2 text-emerald-400" />
                            Use Camera
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Live Image Thumbnail Previews */}
                    {filePreviews.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-xs font-semibold text-slate-300">
                          Attached Proof ({filePreviews.length} / 5)
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {filePreviews.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="group relative rounded-xl overflow-hidden border border-white/15 bg-black/40 aspect-video flex items-center justify-center"
                            >
                              <img
                                src={preview.url}
                                alt={preview.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="self-end w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <div className="text-[10px] text-white truncate font-mono">
                                  {preview.name} ({preview.size})
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!user || uploading || submitComplaint.isPending}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] font-black text-lg border-none shadow-[0_0_35px_rgba(224,200,139,0.4)] hover:shadow-[0_0_55px_rgba(224,200,139,0.7)] hover:scale-[1.01] transition-all duration-300"
                    >
                      {uploading || submitComplaint.isPending ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Transmitting Ticket to Campus Dispatch...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Submit & Dispatch Complaint</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Right Column: Sticky "Live Ticket Hologram Preview" (Cols 8-12) */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="glass-panel-dark rounded-3xl p-6 border border-[#E0C88B]/30 shadow-2xl relative overflow-hidden">
                {/* Hologram top ribbon */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#E0C88B] animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#E0C88B] font-bold">
                      Live Ticket Preview
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    Draft #{Math.floor(1000 + Math.random() * 9000)}
                  </span>
                </div>

                {/* Ticket Title & Status */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                      Ticket Title
                    </span>
                    <h3 className="text-lg font-bold text-foreground font-display mt-0.5">
                      {watchedTitle || (selectedCategoryObj ? `${selectedCategoryObj.name} Maintenance` : "Untitled Complaint")}
                    </h3>
                  </div>

                  {/* Priority & SLA Badge */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Priority</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {selectedPriorityObj ? (
                          <>
                            <selectedPriorityObj.icon className={`w-4 h-4 ${selectedPriorityObj.color}`} />
                            <span className="text-xs font-bold text-foreground">{selectedPriorityObj.label}</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Not selected</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">SLA Target</span>
                      <span className="text-xs font-bold text-[#E0C88B] mt-1 block">
                        {selectedPriorityObj ? selectedPriorityObj.sla : "--"}
                      </span>
                    </div>
                  </div>

                  {/* Location & Department */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#E0C88B]" /> Dept:
                      </span>
                      <span className="font-semibold text-slate-200">
                        {selectedDeptObj?.name || "Not selected"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Building:
                      </span>
                      <span className="font-semibold text-slate-200">
                        {selectedBuildingObj?.name || "Not selected"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-sky-400" /> Room / Spot:
                      </span>
                      <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                        {watchedLocation || "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Live Description Preview */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                      Issue Description
                    </span>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-4 bg-white/[0.02] p-3 rounded-xl border border-white/05 font-sans leading-relaxed">
                      {watchedDescription || "Provide description in the editor to inspect live dispatch preview..."}
                    </p>
                  </div>

                  {/* Evidence Thumbnails Strip */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5">
                      Visual Evidence ({files.length} attached)
                    </span>
                    {filePreviews.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {filePreviews.map((p, i) => (
                          <img
                            key={i}
                            src={p.url}
                            alt="Evidence preview"
                            className="w-14 h-14 rounded-lg object-cover border border-white/20 flex-shrink-0"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic bg-white/[0.02] p-2.5 rounded-lg border border-white/05 text-center">
                        Photo evidence is required to dispatch
                      </div>
                    )}
                  </div>

                  {/* GPS Satellite Lock Status */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10 text-slate-400 font-mono">
                    <span>GPS Telemetry:</span>
                    <span className={coords.latitude ? "text-emerald-400 font-bold" : "text-amber-400"}>
                      {coords.latitude ? "Anchored ✓" : "Pending GPS"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips & Escalation Guarantee Card */}
              <div className="glass-panel rounded-2xl p-4 border border-white/10 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Info className="w-4 h-4 text-[#E0C88B]" />
                  <span>University SLA Guarantee</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Every submitted complaint triggers automatic notifications to the Department HOD and Assigned Maintenance Supervisor. Escalations trigger automatically if unacknowledged within 24 hours.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* QR Scanner Modal Dialog */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
          {showQRScanner && (
            <QRScanner
              onScanSuccess={handleQRScanSuccess}
              onClose={() => setShowQRScanner(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterComplaint;
