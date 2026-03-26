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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
        px-5 py-2.5 rounded-[10px] text-sm font-medium shadow-md flex items-center gap-2
        transition-transform duration-300 z-[1000]
        ${message ? 'translate-y-0' : 'translate-y-20'}`}
    >
      <span className="text-base">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
