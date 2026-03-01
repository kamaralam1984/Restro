'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function PWAProvider() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/95 text-slate-900 text-sm font-medium shadow-lg border border-amber-400"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      You&apos;re offline — some features may be limited
    </div>
  );
}
