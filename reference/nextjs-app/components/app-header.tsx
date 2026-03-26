'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { CABINETS, formatDimensions } from '@/lib/constants';
import { CabinetKey } from '@/lib/types';

export default function AppHeader() {
  const currentCabinet = useConfiguratorStore(s => s.currentCabinet);
  const setCabinet = useConfiguratorStore(s => s.setCabinet);
  const undo = useConfiguratorStore(s => s.undo);
  const redo = useConfiguratorStore(s => s.redo);
  const cartItems = useConfiguratorStore(s => s.cartItems);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 text-[17px] font-bold text-indigo-500 tracking-tight">
        <div className="w-7 h-7 bg-indigo-500 rounded-[7px] flex items-center justify-center text-white text-sm font-bold">
          C
        </div>
        CabinetPro
      </div>

      {/* Center: Cabinet selector + dims + steps */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={currentCabinet}
            onChange={e => setCabinet(e.target.value as CabinetKey)}
            className="appearance-none border border-gray-200 bg-white px-3 py-1.5 pr-8 rounded-md text-[13px] font-semibold text-gray-900 cursor-pointer outline-none focus:border-indigo-500 font-[inherit]"
          >
            {(Object.keys(CABINETS) as CabinetKey[]).map(key => (
              <option key={key} value={key}>{CABINETS[key].label}</option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-500 pointer-events-none">▾</span>
        </div>

        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-medium tabular-nums">
          {formatDimensions(currentCabinet)}
        </span>

        {/* Steps */}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-500 text-white border-[1.5px] border-emerald-500">✓</span>
            Select
          </div>
          <span className="text-gray-200 text-[10px]">→</span>
          <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-indigo-500 text-white border-[1.5px] border-indigo-500">2</span>
            Configure
          </div>
          <span className="text-gray-200 text-[10px]">→</span>
          <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-[1.5px] border-gray-200 text-gray-400">3</span>
            Order
          </div>
        </div>
      </div>

      {/* Right: Undo/Redo + Cart */}
      <div className="flex items-center gap-1.5">
        <button onClick={undo} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M3 8L6.5 4.5M3 8L6.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Undo
        </button>
        <button onClick={redo} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
          Redo
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="relative p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {cartItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
              {cartItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
