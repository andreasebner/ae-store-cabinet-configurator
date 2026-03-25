'use client';

import Link from 'next/link';
import { useConfiguratorStore } from '@/store/configurator-store';
import { CABINETS, formatDimensions, calcPrice } from '@/lib/constants';
import type { CabinetKey, ToolType, Side } from '@/lib/types';
import { SIDES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ShoppingCart, Undo2, Redo2,
  MousePointer2, Circle, Square, RectangleHorizontal,
  Trash2,
} from 'lucide-react';

const TOOLS: { key: ToolType; label: string; shortcut: string; Icon: React.ComponentType<any> }[] = [
  { key: 'move', label: 'Select', shortcut: 'V', Icon: MousePointer2 },
  { key: 'hole', label: 'Hole', shortcut: 'H', Icon: Circle },
  { key: 'rect', label: 'Rect', shortcut: 'R', Icon: Square },
  { key: 'opening', label: 'Opening', shortcut: 'O', Icon: RectangleHorizontal },
];

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function ConfigHeader() {
  const {
    currentCabinet, setCabinet, currentSide, setSide, sideElements,
    activeTool, setTool, undoStack, redoStack, undo, redo,
    clearCurrentSide, zoomLevel, setZoom, addToCart, cartItems,
  } = useConfiguratorStore();

  const price = calcPrice(currentCabinet, sideElements);

  return (
    <header className="h-12 bg-white border-b border-slate-200 flex items-center px-3 gap-2 shrink-0">
      {/* Back */}
      <Link href="/" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition mr-1">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs font-medium hidden sm:inline">Back</span>
      </Link>

      <div className="w-px h-6 bg-slate-200" />

      {/* Cabinet selector */}
      <select
        value={currentCabinet}
        onChange={e => setCabinet(e.target.value as CabinetKey)}
        className="h-7 text-xs border border-slate-200 rounded px-2 bg-white focus:ring-1 focus:ring-brand-500 outline-none"
      >
        {Object.entries(CABINETS).map(([key, spec]) => (
          <option key={key} value={key}>{spec.label} ({spec.w}×{spec.h})</option>
        ))}
      </select>

      <span className="text-[10px] text-slate-400 hidden md:inline">{formatDimensions(currentCabinet)}</span>

      <div className="w-px h-6 bg-slate-200" />

      {/* Side pills */}
      <div className="flex items-center gap-0.5">
        {SIDES.map(side => {
          const count = sideElements[side]?.length || 0;
          const active = currentSide === side;
          return (
            <button
              key={side}
              onClick={() => setSide(side)}
              className={cn(
                'h-7 px-2 text-[11px] rounded capitalize transition-colors',
                active
                  ? 'bg-brand-600 text-white font-medium'
                  : count > 0
                    ? 'text-slate-700 hover:bg-slate-100 font-medium'
                    : 'text-slate-400 hover:bg-slate-50'
              )}
            >
              {side}
              {count > 0 && !active && (
                <span className="ml-0.5 text-[9px] text-brand-500">·{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-px h-6 bg-slate-200" />

      {/* Tools */}
      <div className="flex items-center gap-0.5">
        {TOOLS.map(t => (
          <button
            key={t.key}
            onClick={() => setTool(t.key)}
            title={`${t.label} (${t.shortcut})`}
            className={cn(
              'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
              activeTool === t.key
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            <t.Icon className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-slate-200" />

      {/* Undo/Redo */}
      <button onClick={undo} disabled={undoStack.length === 0} className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30 transition" title="Undo (Ctrl+Z)">
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={redo} disabled={redoStack.length === 0} className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30 transition" title="Redo (Ctrl+Y)">
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={clearCurrentSide}
        className="h-7 px-2 flex items-center gap-1 text-[11px] text-red-500 hover:bg-red-50 rounded transition"
        title={`Clear ${currentSide}`}
      >
        <Trash2 className="h-3 w-3" />
        <span className="hidden lg:inline">Clear</span>
      </button>

      <div className="w-px h-6 bg-slate-200" />

      {/* Zoom */}
      <select
        value={String(zoomLevel)}
        onChange={e => setZoom(Number(e.target.value))}
        className="h-7 text-[11px] border border-slate-200 rounded px-1.5 bg-white focus:ring-1 focus:ring-brand-500 outline-none"
      >
        {ZOOM_LEVELS.map(z => (
          <option key={z} value={String(z)}>{Math.round(z * 100)}%</option>
        ))}
      </select>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Price + Cart */}
      <div className="text-right mr-2">
        <div className="text-[10px] text-slate-400">Total</div>
        <div className="text-sm font-bold text-slate-800">€{price.toFixed(2)}</div>
      </div>

      <button
        onClick={addToCart}
        className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium bg-brand-600 text-white rounded hover:bg-brand-700 transition"
      >
        <ShoppingCart className="h-3.5 w-3.5" />
        Add to Cart
        {cartItems > 0 && (
          <span className="ml-0.5 bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">{cartItems}</span>
        )}
      </button>
    </header>
  );
}
