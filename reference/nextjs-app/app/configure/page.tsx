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
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        {/* Left: 3D Preview */}
        <div className="flex-1 flex flex-col">
          <Cabinet3DPreview />
          <SidePills />
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200" />

        {/* Right: 2D Editor */}
        <div className="w-[480px] flex flex-col bg-white">
          {/* Editor header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-semibold">Panel Editor</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded">
                {currentSide.toUpperCase()}
              </span>
            </div>
            <button
              onClick={clearCurrentSide}
              className="text-[11px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-all"
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
