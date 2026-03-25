'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useConfiguratorStore } from '@/store/configurator-store';
import { CABINET_KEYS } from '@/lib/constants';
import type { CabinetKey } from '@/lib/types';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import ConfigHeader from '@/components/configurator/config-header';
import PanelEditor from '@/components/configurator/panel-editor';
import DetailsPanel from '@/components/configurator/details-panel';
import Toast from '@/components/configurator/toast';
import { CartDrawer } from '@/components/cart/cart-drawer';

const Cabinet3DScene = dynamic(() => import('@/components/configurator/cabinet-3d-scene'), { ssr: false });

export default function ConfigurePage() {
  const searchParams = useSearchParams();
  const setCabinet = useConfiguratorStore(s => s.setCabinet);

  useKeyboardShortcuts();

  // Hydrate cabinet from query param
  useEffect(() => {
    const cab = searchParams.get('cabinet');
    if (cab && CABINET_KEYS.includes(cab as CabinetKey)) {
      setCabinet(cab as CabinetKey);
    }
  }, [searchParams, setCabinet]);

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <ConfigHeader />

      {/* 3-column equal layout */}
      <div className="flex-1 grid grid-cols-3 overflow-hidden">
        {/* Left: 3D Preview */}
        <section className="border-r border-slate-200 bg-slate-50">
          <Cabinet3DScene />
        </section>

        {/* Center: Panel Editor */}
        <section className="border-r border-slate-200 flex flex-col">
          <PanelEditor />
        </section>

        {/* Right: Properties + Element List */}
        <section className="bg-white overflow-hidden">
          <DetailsPanel />
        </section>
      </div>

      <Toast />
      <CartDrawer />
    </div>
  );
}
