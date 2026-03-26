'use client';

import { useEffect } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';

export default function Toast() {
  const message = useConfiguratorStore(s => s.toastMessage);
  const icon = useConfiguratorStore(s => s.toastIcon);
  const clearToast = useConfiguratorStore(s => s.clearToast);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearToast, 2200);
      return () => clearTimeout(timer);
    }
  }, [message, clearToast]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2A2F38] text-[#E8EAED]
        px-5 py-2.5 rounded-sm text-sm font-medium shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-2
        transition-transform duration-300 z-[1000] border border-[#FF6B2C]/30 font-mono
        ${message ? 'translate-y-0' : 'translate-y-20'}`}
    >
      <span className="text-base">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
