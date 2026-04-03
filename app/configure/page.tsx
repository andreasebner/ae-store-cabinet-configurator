import { Suspense } from 'react';
import ConfigurePageClient from '@/components/configurator/configure-page-client';

function LoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="mt-4 text-base text-slate-500 font-medium">Loading configurator…</p>
    </div>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfigurePageClient />
    </Suspense>
  );
}

