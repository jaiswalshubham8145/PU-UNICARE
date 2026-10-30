import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) {
    return null;
  }

  return (
    <aside
      aria-label="Network connection status"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      {isOffline ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-xl border border-amber-500/40 text-amber-200 text-xs font-semibold shadow-[0_4px_20px_rgba(245,158,11,0.25)]">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>You are offline — viewing cached campus facilities.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-[0_4px_20px_rgba(52,211,153,0.25)]">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Connection restored — online sync active.</span>
        </div>
      )}
    </aside>
  );
}

