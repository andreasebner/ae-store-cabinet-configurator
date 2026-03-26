'use client';

import { AppHeader } from '@/components/app-header';
import { SidePills } from '@/components/side-pills';
import { EditorToolbar } from '@/components/editor-toolbar';
import { Cabinet3DPreview } from '@/components/cabinet-3d-preview';
import { PanelEditor } from '@/components/panel-editor';
import { PropertiesPanel } from '@/components/properties-panel';
import { ElementList } from '@/components/element-list';
import { EditorFooter } from '@/components/editor-footer';
import { Toast } from '@/components/toast';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function ConfigurePage() {
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <AppHeader />

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: side pills */}
        <div className="flex items-center justify-center w-16 border-r border-base-300 bg-base-100">
          <SidePills />
        </div>

        {/* Center */}
        <div className="flex flex-col flex-1 min-w-0">
          <EditorToolbar />
          <div className="flex flex-1 min-h-0">
            {/* 3D */}
            <div className="flex items-center justify-center bg-base-100 border-r border-base-300"
              style={{ width: 280, minWidth: 200 }}>
              <Cabinet3DPreview />
            </div>
            {/* 2D editor */}
            <div className="flex flex-col flex-1 min-w-0">
              <PanelEditor />
              <EditorFooter />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col w-72 border-l border-base-300 bg-base-100">
          <PropertiesPanel />
          <div className="divider my-0 px-3" />
          <ElementList />
        </div>
      </div>

      <Toast />
    </div>
  );
}
