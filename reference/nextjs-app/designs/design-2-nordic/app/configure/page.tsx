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
    <div className="h-screen flex flex-col overflow-hidden warm-gradient-bg">
      <AppHeader />
      <div className="flex flex-1 min-h-0 p-4 gap-4">
        {/* Left: 3D Preview — warm card */}
        <div className="flex-1 flex flex-col warm-card overflow-hidden">
          <Cabinet3DPreview />
          <SidePills />
        </div>

        {/* Right: 2D Editor — warm card */}
        <div className="w-[500px] flex flex-col warm-card overflow-hidden">
          {/* Editor header */}
          <div className="px-5 py-4 border-b border-[#EDE8E3] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[15px] font-semibold font-outfit text-[#3D3532]">Panel Editor</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#F3E0DA] text-[#C4644A] px-2.5 py-1 rounded-full">
                {currentSide.toUpperCase()}
              </span>
            </div>
            <button
              onClick={clearCurrentSide}
              className="text-[11px] text-[#A69E97] hover:text-[#3D3532] hover:bg-[#F5F2EE] px-3 py-1.5 rounded-xl transition-all font-medium"
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
