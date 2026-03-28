'use client';

import Link from 'next/link';
import { useConfiguratorStore } from '@/store/configurator-store';
import { useCartStore } from '@/store/cart-store';
import { CABINETS, formatDimensions } from '@/lib/constants';
import type { CabinetKey } from '@/lib/types';
import {
  ArrowLeft, ShoppingCart, Undo2, Redo2,
} from 'lucide-react';

export default function ConfigHeader() {
  const {
    currentCabinet, setCabinet, undoStack, redoStack, undo, redo,
  } = useConfiguratorStore();
  const { toggleCart, itemCount } = useCartStore();
  const cartItems = itemCount();

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
          <option key={key} value={key}>{spec.name} ({spec.w}×{spec.h})</option>
        ))}
      </select>

      <span className="text-[10px] text-slate-400 hidden md:inline">{formatDimensions(currentCabinet)}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button onClick={undo} disabled={undoStack.length === 0} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition" title="Undo (Ctrl+Z)">
          <Undo2 className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:inline">Undo</span>
        </button>
        <button onClick={redo} disabled={redoStack.length === 0} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition" title="Redo (Ctrl+Y)">
          <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:inline">Redo</span>
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Cart */}
      <button
        onClick={toggleCart}
        className="relative h-8 w-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded transition"
        title="Shopping Cart"
      >
        <ShoppingCart className="h-4 w-4" />
        {cartItems > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-brand-600 text-[10px] font-bold text-white px-1">
            {cartItems}
          </span>
        )}
      </button>
    </header>
  );
}
