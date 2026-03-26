'use client';

import dynamic from 'next/dynamic';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import AppHeader from '@/components/app-header';
import SidePills from '@/components/side-pills';
import EditorToolbar from '@/components/editor-toolbar';
import PanelEditor from '@/components/panel-editor';
import PropertiesPanel from '@/components/properties-panel';
import ElementList from '@/components/element-list';
import EditorFooter from '@/components/editor-footer';
import AppToast from '@/components/app-toast';

const Cabinet3DScene = dynamic(() => import('@/components/cabinet-3d-scene'), { ssr: false });

export default function ConfigurePage() {
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: 3D + Sides + Element list */}
        <aside className="w-80 border-r flex flex-col bg-card">
          <div className="h-60 border-b">
            <Cabinet3DScene />
          </div>
          <SidePills />
          <ElementList />
        </aside>

        {/* Center: Toolbar + Editor */}
        <section className="flex-1 flex flex-col">
          <EditorToolbar />
          <PanelEditor />
          <EditorFooter />
        </section>

        {/* Right panel: Properties */}
        <aside className="w-80 border-l bg-card">
          <PropertiesPanel />
        </aside>
      </div>
      <AppToast />
    </div>
  );
}
