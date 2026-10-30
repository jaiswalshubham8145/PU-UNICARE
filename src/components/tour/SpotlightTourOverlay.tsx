import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { tourSteps, type TourStep } from "./tourData";
import { useSiteTourContext } from "./SiteTourContext";

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function SpotlightTourOverlay() {
  const {
    isTourOpen,
    closeTour,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    totalSteps,
    viewMode,
    setViewMode,
  } = useSiteTourContext();

  const navigate = useNavigate();
  const location = useLocation();

  const [rect, setRect] = useState<TargetRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; arrowSide: "top" | "bottom" | "center" }>({
    top: 200,
    left: 200,
    arrowSide: "top",
  });
  const [targetFound, setTargetFound] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const step: TourStep = tourSteps[currentStep] || tourSteps[0];

  // If user opens tour on another page, navigate to home where all tour anchors exist
  useEffect(() => {
    if (isTourOpen && location.pathname !== "/" && step.target) {
      navigate("/");
    }
  }, [isTourOpen, location.pathname, step.target, navigate]);

  // Measure and position spotlight
  const updatePosition = useCallback(() => {
    if (!isTourOpen || viewMode !== "walkthrough") {
      setRect(null);
      return;
    }

    if (!step.target) {
      setRect(null);
      setTargetFound(false);
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) {
      setRect(null);
      setTargetFound(false);
      return;
    }

    const bounds = el.getBoundingClientRect();
    const pad = 10;
    const currentTargetRect: TargetRect = {
      x: Math.max(0, bounds.left - pad),
      y: Math.max(0, bounds.top - pad),
      width: bounds.width + pad * 2,
      height: bounds.height + pad * 2,
    };

    setRect(currentTargetRect);
    setTargetFound(true);

    // Compute popover placement
    const popoverWidth = Math.min(480, window.innerWidth - 32);
    const popoverHeight = 360; // Estimated height for boundary check
    const gap = 16;

    let preferredPlacement = step.placement || "bottom";
    let top = 0;
    let left = Math.max(16, Math.min(
      currentTargetRect.x + currentTargetRect.width / 2 - popoverWidth / 2,
      window.innerWidth - popoverWidth - 16
    ));
    let arrowSide: "top" | "bottom" | "center" = "top";

    if (preferredPlacement === "bottom") {
      // Check if it fits below
      if (currentTargetRect.y + currentTargetRect.height + gap + popoverHeight < window.innerHeight) {
        top = currentTargetRect.y + currentTargetRect.height + gap;
        arrowSide = "top";
      } else {
        // Flip to top
        top = Math.max(16, currentTargetRect.y - gap - popoverHeight);
        arrowSide = "bottom";
      }
    } else if (preferredPlacement === "top") {
      // Check if it fits above
      if (currentTargetRect.y - gap - popoverHeight > 16) {
        top = currentTargetRect.y - gap - popoverHeight;
        arrowSide = "bottom";
      } else {
        // Flip to bottom
        top = Math.min(window.innerHeight - popoverHeight - 16, currentTargetRect.y + currentTargetRect.height + gap);
        arrowSide = "top";
      }
    } else {
      // Default to below
      top = currentTargetRect.y + currentTargetRect.height + gap;
      arrowSide = "top";
    }

    // Safety clamp
    top = Math.max(16, Math.min(top, window.innerHeight - 380));

    setPopoverPos({ top, left, arrowSide });
  }, [isTourOpen, viewMode, step]);

  // Scroll target into view on step change
  useEffect(() => {
    if (!isTourOpen || viewMode !== "walkthrough") return;

    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // Wait for smooth scroll then position
    const t1 = setTimeout(updatePosition, 100);
    const t2 = setTimeout(updatePosition, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentStep, isTourOpen, viewMode, step.target, updatePosition]);

  // Keep pinned during resize and scroll
  useEffect(() => {
    if (!isTourOpen) return;

    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isTourOpen, updatePosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourOpen, closeTour, nextStep, prevStep]);

  if (!isTourOpen || viewMode !== "walkthrough") {
    return null;
  }

  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none">
      {/* SVG Spotlight Cutout Backdrop */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto transition-all duration-300"
        style={{ width: "100vw", height: "100vh" }}
        onClick={closeTour}
      >
        <defs>
          <mask id="pu-tour-spotlight-mask">
            {/* White covers everything (visible) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cuts out the spotlight hole */}
            {rect && (
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Translucent Dim Layer */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(6, 15, 16, 0.82)"
          mask="url(#pu-tour-spotlight-mask)"
          className="backdrop-blur-[2px]"
        />
      </svg>

      {/* Pulsing Emerald Halo around Target */}
      {rect && (
        <motion.div
          layoutId="tour-spotlight-box"
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          style={{
            position: "fixed",
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            pointerEvents: "none",
            borderRadius: 16,
          }}
          className="border-2 border-emerald-400 bg-emerald-400/10 shadow-[0_0_40px_rgba(52,211,153,0.85),inset_0_0_25px_rgba(52,211,153,0.35)] animate-pulse"
        />
      )}

      {/* Floating Tooltip Popover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={popoverRef}
          initial={{ opacity: 0, y: popoverPos.arrowSide === "top" ? 12 : -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: targetFound ? popoverPos.top : "50%",
            left: targetFound ? popoverPos.left : "50%",
            transform: targetFound ? undefined : "translate(-50%, -50%)",
            maxWidth: 480,
            width: "calc(100vw - 32px)",
            pointerEvents: "auto",
          }}
          className="relative z-[101] bg-[#0A1719]/95 text-foreground rounded-2xl border border-emerald-400/50 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(52,211,153,0.35)] backdrop-blur-xl p-6"
        >
          {/* Directional Pointer Arrow */}
          {targetFound && popoverPos.arrowSide === "top" && (
            <div
              style={{
                left: Math.max(24, Math.min(456, (rect ? (rect.x + rect.width / 2) - popoverPos.left : 40))),
              }}
              className="absolute -top-2 w-4 h-4 bg-[#0A1719] border-t border-l border-emerald-400/60 transform rotate-45 -translate-x-1/2 pointer-events-none"
            />
          )}
          {targetFound && popoverPos.arrowSide === "bottom" && (
            <div
              style={{
                left: Math.max(24, Math.min(456, (rect ? (rect.x + rect.width / 2) - popoverPos.left : 40))),
              }}
              className="absolute -bottom-2 w-4 h-4 bg-[#0A1719] border-b border-r border-emerald-400/60 transform rotate-45 -translate-x-1/2 pointer-events-none"
            />
          )}
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                Step {currentStep + 1} of {totalSteps}
              </span>
              {step.badge && (
                <span className="text-[11px] font-semibold text-[#E0C88B] tracking-wide">
                  • {step.badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("directory")}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-emerald-300 px-2 py-1 rounded-md hover:bg-emerald-500/10 transition-colors"
                title="Browse All 25+ University Pages"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Directory
              </button>
              <button
                onClick={closeTour}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Icon */}
          <div className="flex items-start gap-3.5 mb-2.5">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.accentColor} flex items-center justify-center shrink-0 shadow-lg shadow-black/40 border border-white/20`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                {step.title}
              </h3>
              <p className="text-xs font-semibold text-[#E0C88B]">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {step.description}
          </p>

          {/* Highlights */}
          <div className="space-y-1.5 mb-4 bg-emerald-950/30 rounded-xl p-2.5 border border-emerald-500/20">
            {step.highlights.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>

          {/* Action Links */}
          {step.links && step.links.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {step.links.map((link) => (
                <Button
                  key={link.path}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    closeTour();
                    if (link.path === "#ai-chat") {
                      window.dispatchEvent(new CustomEvent("unicare:open-ai-chat"));
                    } else if (link.path === "#voice-complaint" || link.path.includes("action=voice-complaint")) {
                      window.dispatchEvent(new CustomEvent("unicare:open-voice-assistant"));
                    } else if (!link.path.startsWith("#")) {
                      navigate(link.path);
                    }
                  }}
                  className="h-7 text-xs border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/20 hover:text-white gap-1"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              ))}
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentStep
                      ? "w-6 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      : "w-2 bg-slate-600 hover:bg-slate-400"
                    }`}
                  aria-label={`Jump to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Back / Next Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={isFirst}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Back
              </Button>

              <Button
                size="sm"
                onClick={nextStep}
                className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(52,211,153,0.45)] hover:shadow-[0_0_25px_rgba(52,211,153,0.7)]"
              >
                {isLast ? (
                  <>
                    Finish
                    <Sparkles className="w-3.5 h-3.5 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
