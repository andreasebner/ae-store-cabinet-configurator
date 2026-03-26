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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#3D3532] text-white
        px-6 py-3 rounded-2xl text-sm font-medium shadow-[0_4px_20px_rgba(61,53,50,0.2)] flex items-center gap-2.5
        transition-all duration-300 z-[1000] border border-[#5C5550]
        ${message ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
    >
      <span className="w-6 h-6 rounded-full bg-[#C4644A]/20 flex items-center justify-center text-base">{icon}</span>
      <span className="font-manrope">{message}</span>
    </div>
  );
}
