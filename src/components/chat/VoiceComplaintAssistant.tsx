import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2,
  MapPin,
  Tag,
  Flame,
  Zap,
  Clock,
  ShieldCheck,
  Edit3,
  Volume2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDepartments, useCategories, useBuildings } from "@/hooks/useComplaints";
import { extractComplaintPayload, type ExtractedComplaintPayload } from "@/services/AIService";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────
type SpeechLang = "auto" | "gu-IN" | "hi-IN" | "en-IN";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VoiceComplaintAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Language Pill config ──────────────────────────────────────
const langPills: { value: SpeechLang; label: string; flag: string }[] = [
  { value: "auto", label: "Auto / Mix", flag: "🌐" },
  { value: "gu-IN", label: "ગુજરાતી", flag: "🇮🇳" },
  { value: "hi-IN", label: "हिन्दी", flag: "🇮🇳" },
  { value: "en-IN", label: "English", flag: "🇬🇧" },
];

// ─── Priority badge config ─────────────────────────────────────
const priorityBadge: Record<string, { icon: typeof Flame; color: string; bg: string }> = {
  critical: { icon: Flame, color: "text-rose-400", bg: "bg-rose-500/20" },
  high: { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/20" },
  medium: { icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  low: { icon: ShieldCheck, color: "text-sky-400", bg: "bg-sky-500/20" },
};

// ─── Follow-up question templates ──────────────────────────────
const followUpQuestions: Record<string, string> = {
  department: "Which department does this issue belong to? (e.g., Computer Science, Civil, Mechanical, Electrical, IT, Pharmacy)",
  building: "Which building or block is this issue located in? (e.g., Engineering Block, Admin Building, Library)",
  category: "What type of issue is this? (e.g., Electrical, Plumbing, AC/HVAC, Carpentry, Cleaning, IT Support, Civil, Security)",
  location: "Can you specify the exact location? (e.g., Room 204, Ground Floor Lab, 3rd Floor Corridor)",
};

// ─── Component ─────────────────────────────────────────────────
const VoiceComplaintAssistant = ({ isOpen, onClose }: VoiceComplaintAssistantProps) => {
  const navigate = useNavigate();

  // Data hooks
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();
  const { data: buildings } = useBuildings();

  // Local state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechLang, setSpeechLang] = useState<SpeechLang>("auto");
  const [payload, setPayload] = useState<ExtractedComplaintPayload | null>(null);
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const amplitudeInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showPreview]);

  // Send welcome message on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addAssistantMessage(
        "🎤 **Welcome to AI Voice Complaint Assistant!**\n\nJust speak or type your issue — describe the problem, building (e.g., A1 PIET, Kalam Bhawan, Central Food Court), room, and urgency. I'll auto-extract everything and create your complaint ticket!\n\n*Example: \"A1 PIET Block lab 204 ma AC bandh che, urgent issue\" or \"Central Food Court washroom tap leak thaay che\"*"
      );
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {
          // ignore cleanup error
        }
      }
      if (amplitudeInterval.current) clearInterval(amplitudeInterval.current);
    };
  }, []);

  // ─── Message helpers ──────────────────────────────────────
  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    const msg: ChatMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const addAssistantMessage = useCallback((content: string) => {
    return addMessage("assistant", content);
  }, [addMessage]);

  // ─── Core processing: extract payload from accumulated text ──────
  const processUserInput = useCallback((text: string, existingPayload?: ExtractedComplaintPayload | null) => {
    const deptList = departments?.map(d => ({ id: d.id, name: d.name })) || null;
    const bldList = buildings?.map(b => ({ id: b.id, name: b.name })) || null;
    const catList = categories?.map(c => ({ id: c.id, name: c.name })) || null;

    const currentPartial = existingPayload ? {
      departmentId: existingPayload.departmentId,
      departmentName: existingPayload.departmentName,
      buildingId: existingPayload.buildingId,
      buildingName: existingPayload.buildingName,
      categoryId: existingPayload.categoryId,
      categoryName: existingPayload.categoryName,
      location: existingPayload.location,
      priority: existingPayload.priority,
      title: existingPayload.title,
    } : undefined;

    const newPayload = extractComplaintPayload(text, deptList, bldList, catList, currentPartial);
    setPayload(newPayload);

    // Check extracted fields and provide feedback
    const extracted: string[] = [];
    if (newPayload.departmentName) extracted.push(`🏢 Department: **${newPayload.departmentName}**`);
    if (newPayload.buildingName) extracted.push(`🏛️ Building: **${newPayload.buildingName}**`);
    if (newPayload.categoryName) extracted.push(`🔧 Category: **${newPayload.categoryName}**`);
    if (newPayload.location) extracted.push(`📍 Location: **${newPayload.location}**`);
    extracted.push(`⚡ Priority: **${newPayload.priority.charAt(0).toUpperCase() + newPayload.priority.slice(1)}**`);

    if (newPayload.isComplete) {
      addAssistantMessage(
        `✅ **All details captured!** Here's what I extracted:\n\n${extracted.join("\n")}\n📝 Title: **${newPayload.title}**\n\nClick **"Verify & Add Evidence"** below to proceed!`
      );
      setShowPreview(true);
      setPendingFollowUp(null);
    } else {
      // Ask about the first missing field
      const firstMissing = newPayload.missingFields[0];
      const missingCount = newPayload.missingFields.length;
      const feedbackMsg = extracted.length > 1
        ? `🧠 I extracted:\n${extracted.join("\n")}\n\nBut I still need **${missingCount}** more detail${missingCount > 1 ? "s" : ""}:\n\n💬 ${followUpQuestions[firstMissing] || `Please provide the ${firstMissing}.`}`
        : `💬 ${followUpQuestions[firstMissing] || `Please provide the ${firstMissing}.`}`;

      addAssistantMessage(feedbackMsg);
      setPendingFollowUp(firstMissing);
    }

    return newPayload;
  }, [departments, buildings, categories, addAssistantMessage]);

  // ─── Handle send (text or voice transcript) ─────────────
  const handleSend = useCallback((text?: string) => {
    const content = (text || inputValue).trim();
    if (!content) return;

    addMessage("user", content);
    setInputValue("");

    // Merge new text with existing description for cumulative extraction
    const accumulatedText = payload
      ? `${payload.description} ${content}`
      : content;

    processUserInput(accumulatedText, payload);
  }, [inputValue, payload, addMessage, processUserInput]);

  // ─── Speech Recognition ─────────────────────────────────
  const toggleSpeech = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input is not supported. Please use Chrome or Edge.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {
        // ignore stop error
      }
      setIsRecording(false);
      if (amplitudeInterval.current) clearInterval(amplitudeInterval.current);
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = speechLang === "auto" ? "en-IN" : speechLang;

    recognition.onstart = () => {
      setIsRecording(true);
      // Simulate amplitude animation
      amplitudeInterval.current = setInterval(() => {
        setAmplitude(Math.random() * 100);
      }, 100);

      const langNotice = speechLang === "auto"
        ? "🎤 Listening... Speak in Hindi, Gujarati, English, or mixed!"
        : speechLang === "gu-IN"
          ? "🎤 સાંભળી રહ્યું છે... ગુજરાતીમાં બોલો."
          : speechLang === "hi-IN"
            ? "🎤 सुन रहा हूँ... हिन्दी में बोलें।"
            : "🎤 Listening in English...";
      toast(langNotice);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setAmplitude(0);
      if (amplitudeInterval.current) clearInterval(amplitudeInterval.current);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      setAmplitude(0);
      if (amplitudeInterval.current) clearInterval(amplitudeInterval.current);

      if (event.error === "not-allowed" || event.error === "audio-capture") {
        toast.error("Microphone access denied. Please grant permissions.");
      } else if (event.error === "no-speech") {
        toast.error("No speech detected. Speak closer to the mic.");
      } else {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSend(transcript);
      }
    };

    try {
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  }, [isRecording, speechLang, handleSend]);

  // ─── Navigate to RegisterComplaint with pre-filled data ──
  const handleProceed = useCallback(() => {
    if (!payload) return;

    // Navigate with full state payload
    navigate("/register-complaint", {
      state: {
        aiAssistantPayload: {
          departmentId: payload.departmentId,
          buildingId: payload.buildingId,
          categoryId: payload.categoryId,
          location: payload.location,
          priority: payload.priority,
          title: payload.title,
          description: payload.description,
        },
      },
    });

    toast.success("✨ AI Assistant data transferred! Please add photo evidence and confirm.", {
      duration: 5000,
    });

    // Reset and close
    onClose();
    setMessages([]);
    setPayload(null);
    setShowPreview(false);
    setPendingFollowUp(null);
  }, [payload, navigate, onClose]);

  // ─── Reset conversation ──────────────────────────────────
  const handleReset = useCallback(() => {
    setMessages([]);
    setPayload(null);
    setShowPreview(false);
    setPendingFollowUp(null);
    setInputValue("");
    addAssistantMessage(
      "🔄 **Conversation reset!** Tell me about your new issue — speak naturally in any language."
    );
  }, [addAssistantMessage]);

  if (!isOpen) return null;

  const PriorityIcon = payload ? priorityBadge[payload.priority]?.icon || Clock : Clock;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg flex flex-col max-h-[85vh] rounded-3xl overflow-hidden border border-[#E0C88B]/30 shadow-[0_0_80px_rgba(224,200,139,0.2),0_25px_60px_rgba(0,0,0,0.7)]"
          style={{
            background: "linear-gradient(165deg, rgba(15,25,30,0.97) 0%, rgba(10,18,22,0.98) 50%, rgba(12,20,26,0.97) 100%)",
          }}
        >
          {/* ─── Header ───────────────────────────────────── */}
          <div className="relative px-5 py-4 border-b border-[#E0C88B]/20 flex items-center justify-between shrink-0">
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#E0C88B]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E0C88B]/30 to-emerald-500/20 flex items-center justify-center border border-[#E0C88B]/40 shadow-[0_0_20px_rgba(224,200,139,0.25)]">
                <Sparkles className="w-5 h-5 text-[#E0C88B]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F7F2E7] tracking-wide">AI Complaint Assistant</h3>
                <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Voice + Text • Multilingual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-8 w-8 text-slate-400 hover:text-[#E0C88B] hover:bg-[#E0C88B]/10 rounded-xl"
                title="Reset conversation"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* ─── Language Pills ────────────────────────────── */}
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2 shrink-0 overflow-x-auto">
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {langPills.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setSpeechLang(pill.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                  speechLang === pill.value
                    ? "bg-[#E0C88B]/20 text-[#E0C88B] border-[#E0C88B]/40 shadow-[0_0_12px_rgba(224,200,139,0.2)]"
                    : "text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-300 bg-white/[0.03]"
                )}
              >
                {pill.flag} {pill.label}
              </button>
            ))}
          </div>

          {/* ─── Chat Messages ────────────────────────────── */}
          <ScrollArea className="flex-1 px-4 py-3 min-h-0">
            <div className="space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2.5 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border",
                      msg.role === "user"
                        ? "bg-[#E0C88B]/20 border-[#E0C88B]/30 text-[#E0C88B]"
                        : "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                    )}
                  >
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-[#E0C88B]/15 text-[#F7F2E7] rounded-tr-sm border border-[#E0C88B]/20"
                        : "bg-white/[0.05] text-slate-200 rounded-tl-sm border border-white/10"
                    )}
                  >
                    {/* Simple markdown: bold */}
                    {msg.content.split("\n").map((line, li) => (
                      <span key={li}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, pi) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={pi} className="text-[#E0C88B] font-bold">
                              {part.slice(2, -2)}
                            </strong>
                          ) : (
                            <span key={pi}>{part}</span>
                          )
                        )}
                        {li < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* ─── Live Holographic Ticket Preview Card ──── */}
              {showPreview && payload && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="rounded-2xl border border-[#E0C88B]/30 p-4 mt-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(224,200,139,0.08), rgba(52,211,153,0.05), rgba(10,18,22,0.9))",
                    boxShadow: "0 0 40px rgba(224,200,139,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                      Complaint Dossier Preview
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-[#F7F2E7] mb-3 leading-snug">
                    {payload.title}
                  </h4>

                  {/* Field badges grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {payload.departmentName && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
                        <Building2 className="w-3 h-3 text-sky-400" />
                        <span className="text-[10px] text-slate-300 truncate">{payload.departmentName}</span>
                      </div>
                    )}
                    {payload.buildingName && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
                        <Building2 className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-slate-300 truncate">{payload.buildingName}</span>
                      </div>
                    )}
                    {payload.categoryName && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
                        <Tag className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] text-slate-300 truncate">{payload.categoryName}</span>
                      </div>
                    )}
                    {payload.location && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span className="text-[10px] text-slate-300 truncate">{payload.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Priority badge */}
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3",
                    priorityBadge[payload.priority]?.bg || "bg-emerald-500/20"
                  )}>
                    <PriorityIcon className={cn("w-3 h-3", priorityBadge[payload.priority]?.color || "text-emerald-400")} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", priorityBadge[payload.priority]?.color || "text-emerald-400")}>
                      {payload.priority} Priority
                    </span>
                  </div>

                  {/* Description snippet */}
                  <p className="text-[11px] text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {payload.description}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleProceed}
                      className="flex-1 h-9 text-xs font-bold bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] text-[#060F10] hover:shadow-[0_0_30px_rgba(224,200,139,0.5)] rounded-xl transition-all"
                    >
                      Verify & Add Evidence <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { setShowPreview(false); setPendingFollowUp(null); }}
                      className="h-9 px-3 text-xs text-slate-400 hover:text-[#E0C88B] border border-white/10 hover:border-[#E0C88B]/30 rounded-xl"
                    >
                      <Edit3 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </div>
                </motion.div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* ─── Input Area ────────────────────────────────── */}
          <div className="px-4 py-3 border-t border-white/10 shrink-0">
            {/* Soundwave animation when recording */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 flex items-center justify-center gap-0.5"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-[#E0C88B]"
                    animate={{
                      height: [4, 4 + Math.random() * (amplitude * 0.3), 4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.3 + Math.random() * 0.3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
                <span className="ml-3 text-[11px] text-[#E0C88B] font-mono animate-pulse">
                  Listening...
                </span>
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              {/* Big Mic Button */}
              <button
                onClick={toggleSpeech}
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 border",
                  isRecording
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse"
                    : "bg-[#E0C88B]/10 border-[#E0C88B]/30 text-[#E0C88B] hover:bg-[#E0C88B]/20 hover:shadow-[0_0_20px_rgba(224,200,139,0.2)]"
                )}
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isRecording ? "Listening..." : "Type or speak your issue..."}
                  disabled={isRecording}
                  className="bg-white/[0.04] border-white/10 text-[#F7F2E7] h-11 rounded-xl text-xs placeholder:text-slate-500 focus-visible:ring-[#E0C88B]/50 focus-visible:border-[#E0C88B]/40 pr-10"
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isRecording}
                size="icon"
                className="w-11 h-11 rounded-xl bg-[#E0C88B]/20 hover:bg-[#E0C88B]/30 text-[#E0C88B] border border-[#E0C88B]/30 shrink-0 disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceComplaintAssistant;
