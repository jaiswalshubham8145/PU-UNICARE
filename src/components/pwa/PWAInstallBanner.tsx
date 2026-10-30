import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Sparkles, Share, RefreshCw, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function PWAInstallBanner() {
  const {
    canInstall,
    isInstalled,
    isIOS,
    isDismissed,
    promptInstall,
    dismissPrompt,
    updateAvailable,
    updateApp,
  } = usePWAInstall();

  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed and no update, render nothing
  if (isInstalled && !updateAvailable) {
    return null;
  }

  // Handle service worker update notification
  if (updateAvailable) {
    return (
      <aside
        aria-label="App update available"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="p-4 rounded-2xl bg-[#060F10]/95 backdrop-blur-xl border border-[#E0C88B]/60 shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(224,200,139,0.3)] text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E0C88B]/20 border border-[#E0C88B]/50 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-[#E0C88B] animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#E0C88B]">Update Available</p>
              <p className="text-[11px] text-muted-foreground">A new version of PU UNICARE is ready.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={updateApp}
            className="bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] text-[#060F10] font-bold text-xs h-8 px-3 rounded-xl shadow-md hover:scale-105 transition-all"
          >
            Update
          </Button>
        </div>
      </aside>
    );
  }

  // Do not render install prompt if dismissed or unsupported
  if (isDismissed || (!canInstall && !isIOS)) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    setInstalling(true);
    await promptInstall();
    setInstalling(false);
  };

  return (
    <>
      <aside
        aria-label="Install PU UNICARE App"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-50 animate-in fade-in slide-in-from-bottom-6 duration-300"
      >
        <div className="relative p-4 rounded-2xl bg-[#060F10]/95 backdrop-blur-2xl border border-emerald-400/40 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(52,211,153,0.25)] text-foreground overflow-hidden">
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#34D399]/20 to-transparent rounded-bl-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => dismissPrompt(7)}
            className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            title="Dismiss for 7 days"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#164340] to-[#0A1826] border border-[#E0C88B]/60 shadow-[0_0_15px_rgba(224,200,139,0.3)] flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-[#E0C88B]" />
            </div>

            {/* Content */}
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-bold text-gradient-gold">Install PU UNICARE</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-400/15 text-emerald-400 border border-emerald-400/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add to your home screen for instant offline access, voice complaint filing, and live campus updates.
              </p>

              {/* Perks */}
              <div className="grid grid-cols-2 gap-1.5 my-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-foreground/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Offline Ready</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-foreground/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E0C88B] shrink-0" />
                  <span>Instant Notifications</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] font-extrabold text-xs h-8 px-4 rounded-xl shadow-[0_0_15px_rgba(224,200,139,0.4)] transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installing ? 'Installing...' : 'Install App'}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissPrompt(7)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-xl hover:bg-white/5"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Instructions Modal */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="glass-panel border-emerald-400/30 bg-[#060F10]/95 backdrop-blur-2xl text-foreground max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-gradient-gold">
              <Sparkles className="w-5 h-5 text-[#E0C88B]" />
              Install on iOS
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              To install PU UNICARE on your iPhone or iPad, follow these simple steps in Safari:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-7 h-7 rounded-lg bg-[#E0C88B]/20 text-[#E0C88B] font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Tap the Share button</p>
                <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                  Look for <Share className="w-3.5 h-3.5 inline text-[#E0C88B]" /> in the Safari bottom bar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Select "Add to Home Screen"</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Scroll down the menu and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-7 h-7 rounded-lg bg-[#E0C88B]/20 text-[#E0C88B] font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Confirm "Add"</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Tap <strong>Add</strong> in the top-right corner to place PU UNICARE on your device.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              setShowIOSModal(false);
              dismissPrompt(7);
            }}
            className="w-full bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] text-[#060F10] font-bold text-xs rounded-xl h-9"
          >
            Got it, thanks!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

