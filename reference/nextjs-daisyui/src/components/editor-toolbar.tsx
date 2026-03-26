'use client';

import { useConfiguratorStore } from '@/lib/configurator-store';
import type { ToolType } from '@/lib/types';

const TOOLS: { value: ToolType; label: string; icon: string }[] = [
  { value: 'hole', icon: '○', label: 'Hole (V)' },
  { value: 'rect', icon: '□', label: 'Rect (H)' },
  { value: 'opening', icon: '▢', label: 'Opening (O)' },
  { value: 'move', icon: '✥', label: 'Move (M)' },
];

export function EditorToolbar() {
  const { activeTool, setTool, undo, redo, undoStack, redoStack, zoomLevel, setZoom, clearCurrentSide } =
    useConfiguratorStore();

  return (
    <div className="flex items-center gap-2 px-3 py-1 border-b border-base-300 bg-base-100">
      {/* Tool toggle */}
      <div className="join">
        {TOOLS.map(t => (
          <button
            key={t.value}
            className={`join-item btn btn-sm ${activeTool === t.value ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTool(t.value)}
          >
            <span className="mr-1">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Undo / Redo */}
      <div className="tooltip tooltip-bottom" data-tip="Undo (Ctrl+Z)">
        <button className="btn btn-ghost btn-sm btn-square" disabled={!undoStack.length} onClick={undo}>↩</button>
      </div>
      <div className="tooltip tooltip-bottom" data-tip="Redo (Ctrl+Y)">
        <button className="btn btn-ghost btn-sm btn-square" disabled={!redoStack.length} onClick={redo}>↪</button>
      </div>

      <div className="divider divider-horizontal mx-0" />

      {/* Zoom */}
      <button className="btn btn-ghost btn-sm btn-square" onClick={() => setZoom(zoomLevel + 0.1)}>🔍+</button>
      <span className="text-xs font-mono w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
      <button className="btn btn-ghost btn-sm btn-square" onClick={() => setZoom(zoomLevel - 0.1)}>🔍−</button>

      <div className="divider divider-horizontal mx-0" />

      {/* Clear */}
      <button className="btn btn-ghost btn-sm text-warning gap-1" onClick={clearCurrentSide}>
        🗑 Clear Side
      </button>
    </div>
  );
}
