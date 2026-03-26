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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2
        px-5 py-2.5 text-sm font-medium flex items-center gap-2
        transition-transform duration-300 z-[1000]`}
      style={{
        background: 'var(--navy-raised)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--cyan)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 229, 255, 0.1)',
        transform: message ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)',
      }}
    >
      <span className="text-base">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
