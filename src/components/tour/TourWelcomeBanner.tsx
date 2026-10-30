import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourWelcomeBannerProps {
  visible: boolean;
  onStartTour: () => void;
  onDismiss: () => void;
}

const TourWelcomeBanner = ({
  visible,
  onStartTour,
  onDismiss,
}: TourWelcomeBannerProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[92vw] max-w-lg"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(52,211,153,0.15)]">
            {/* Ambient glow gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <div className="absolute -top-24 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-accent/10 transition-colors z-10"
              aria-label="Dismiss tour banner"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-5 flex items-start gap-4">
              {/* Animated icon */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.2)]"
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground">
                  Welcome to PU UNICARE! 👋
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  New here? Take a quick 2-minute visual tour of our campus
                  platform — explore AI Voice complaint auto-filing, 24/7 AI chatbot, and all tools.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    onClick={onStartTour}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(52,211,153,0.35)] hover:shadow-[0_0_25px_rgba(52,211,153,0.55)] transition-all rounded-full px-5 text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Start Site Tour
                  </Button>
                  <Button
                    onClick={onDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground text-xs font-semibold"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TourWelcomeBanner;
