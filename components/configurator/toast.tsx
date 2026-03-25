'use client';

import { useEffect } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toastMessage, toastIcon, clearToast } = useConfiguratorStore();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(clearToast, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const iconMap: Record<string, React.ReactNode> = {
    '✓': <CheckCircle2 className="h-4 w-4 text-brand-500" />,
    '🛒': <CheckCircle2 className="h-4 w-4 text-brand-500" />,
    '↩': <Info className="h-4 w-4 text-slate-500" />,
    '↪': <Info className="h-4 w-4 text-slate-500" />,
    '🗑': <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border border-slate-200',
      'bg-white text-slate-700 text-sm animate-in slide-in-from-bottom-4 fade-in duration-300'
    )}>
      {iconMap[toastIcon] || <Info className="h-4 w-4 text-slate-400" />}
      <span>{toastMessage}</span>
      <button onClick={clearToast} className="ml-2 text-slate-400 hover:text-slate-600 transition">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
