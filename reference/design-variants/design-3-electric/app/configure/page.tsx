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
    <div className="h-screen flex flex-col overflow-hidden relative z-10">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        {/* Left: 3D Preview */}
        <div className="flex-1 flex flex-col">
          <Cabinet3DPreview />
          <SidePills />
        </div>

        {/* Divider - cyan trace line */}
        <div className="w-px relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,229,255,0.2)] to-transparent" />
        </div>

        {/* Right: 2D Editor */}
        <div className="w-[480px] flex flex-col" style={{ background: 'var(--navy-surface)' }}>
          {/* Editor header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-semibold font-chakra tracking-wide" style={{ color: 'var(--text-primary)' }}>
                PANEL EDITOR
              </h2>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                style={{
                  background: 'var(--cyan-subtle)',
                  color: 'var(--cyan)',
                  border: '1px solid rgba(0, 229, 255, 0.15)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-chakra), Chakra Petch, sans-serif',
                }}
              >
                {currentSide.toUpperCase()}
              </span>
            </div>
            <button
              onClick={clearCurrentSide}
              className="text-[11px] px-2 py-1 rounded transition-all font-medium"
              style={{
                color: 'var(--text-tertiary)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--red)';
                e.currentTarget.style.background = 'rgba(255, 61, 90, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
                e.currentTarget.style.background = 'transparent';
              }}
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
