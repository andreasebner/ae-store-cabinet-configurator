'use client';

import { useConfiguratorStore } from '@/lib/configurator-store';
import { CABINETS } from '@/lib/constants';
import type { CabinetKey } from '@/lib/types';

export function AppHeader() {
  const { currentCabinet, setCabinet, price, cartItems, addToCart } = useConfiguratorStore();

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 min-h-12 gap-2">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-bold text-base text-primary">Cabinet Configurator</span>
      </div>

      <div className="flex-1" />

      {/* Cabinet select */}
      <select
        className="select select-bordered select-sm w-56"
        value={currentCabinet}
        onChange={e => setCabinet(e.target.value as CabinetKey)}
      >
        {Object.entries(CABINETS).map(([k, v]) => (
          <option key={k} value={k}>{v.name} ({v.w}×{v.h}×{v.d} mm)</option>
        ))}
      </select>

      {/* Price badge */}
      <div className="badge badge-primary badge-lg gap-1 font-mono">
        € {price.toFixed(2)}
      </div>

      {/* Cart button */}
      <button className="btn btn-primary btn-sm gap-1" onClick={addToCart}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        Add to Cart
        {cartItems > 0 && (
          <div className="badge badge-error badge-sm">{cartItems}</div>
        )}
      </button>
    </div>
  );
}
