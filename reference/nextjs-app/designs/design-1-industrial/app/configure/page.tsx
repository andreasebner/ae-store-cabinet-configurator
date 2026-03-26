'use client';

import AppHeader from '@/components/app-header';
import Cabinet3DPreview from '@/components/cabinet-3d-preview';
import SidePills from '@/components/side-pills';
import EditorToolbar from '@/components/editor-toolbar';
import PanelEditor from '@/components/panel-editor';
import PropertiesPanel from '@/components/properties-panel';
import ElementList from '@/components/element-list';
import EditorFooter from '@/components/editor-footer';
import Toast from '@/components/toast';
import { useConfiguratorStore } from '@/store/configurator-store';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function ConfigurePage() {
  useKeyboardShortcuts();
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const clearCurrentSide = useConfiguratorStore(s => s.clearCurrentSide);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#1A1D23]">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        {/* Left: 3D Preview */}
        <div className="flex-1 flex flex-col">
          <Cabinet3DPreview />
          <SidePills />
        </div>

        {/* Divider — industrial thick border */}
        <div className="w-px bg-[#3A3F4A]" />

        {/* Right: 2D Editor */}
        <div className="w-[480px] flex flex-col bg-[#22262E]">
          {/* Editor header */}
          <div className="px-4 py-3 border-b border-[#3A3F4A] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[14px] font-semibold text-[#E8EAED] tracking-tight">Panel Editor</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FF6B2C]/10 text-[#FF6B2C] px-2 py-0.5 rounded-sm border border-[#FF6B2C]/20 font-mono">
                {currentSide.toUpperCase()}
              </span>
            </div>
            <button
              onClick={clearCurrentSide}
              className="text-[11px] text-[#6B7280] hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 px-2 py-1 rounded-sm transition-all font-medium uppercase tracking-wider border border-transparent hover:border-[#E74C3C]/20"
            >
              Clear All
            </button>
          </div>

          <EditorToolbar />
          <PanelEditor />
          <PropertiesPanel />
          <ElementList />
          <EditorFooter />
        </div>
      </div>
      <Toast />
    </div>
  );
}
