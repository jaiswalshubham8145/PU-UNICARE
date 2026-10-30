import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, PlayCircle, BookOpen } from "lucide-react";
import TourPageDirectory from "./TourPageDirectory";
import TourWelcomeBanner from "./TourWelcomeBanner";
import { SpotlightTourOverlay } from "./SpotlightTourOverlay";
import { useTourContext } from "./SiteTourContext";

const SiteTourModal = () => {
  const {
    isTourOpen,
    openTour,
    closeTour,
    showWelcomeBanner,
    dismissBanner,
    viewMode,
    setViewMode,
  } = useTourContext();

  return (
    <>
      {/* First-Time Welcome Banner */}
      <TourWelcomeBanner
        visible={showWelcomeBanner}
        onStartTour={openTour}
        onDismiss={dismissBanner}
      />

      {/* On-Screen Spotlight Walkthrough Mode */}
      <SpotlightTourOverlay />

      {/* All Pages Directory Mode Dialog */}
      <Dialog
        open={isTourOpen && viewMode === "directory"}
        onOpenChange={(open) => !open && closeTour()}
      >
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] p-0 gap-0 border-emerald-400/30 bg-[#061011]/98 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(52,211,153,0.2)] text-foreground overflow-hidden">
          {/* Header */}
          <div className="relative px-6 pt-5 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white tracking-tight">
                    PU UNICARE Directory & Navigation Hub
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-300">
                    Explore all 25+ university maintenance pages, roles, and tools
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setViewMode("walkthrough")}
                  className="h-8 gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Spotlight Tour
                </Button>
                <button
                  onClick={closeTour}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close directory"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Directory Content */}
          <div className="relative px-6 py-5 max-h-[65vh] overflow-y-auto">
            <TourPageDirectory onClose={closeTour} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SiteTourModal;
