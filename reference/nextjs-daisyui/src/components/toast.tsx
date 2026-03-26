'use client';

import { useEffect } from 'react';
import { useConfiguratorStore } from '@/lib/configurator-store';

export function Toast() {
  const { toastMessage, toastIcon, clearToast } = useConfiguratorStore();

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(clearToast, 2500);
      return () => clearTimeout(t);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className="toast toast-end toast-bottom z-50">
      <div className="alert alert-success shadow-lg">
        <span>{toastIcon}</span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
