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
    <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
      {/* Logo — terracotta accent */}
      <div className="flex items-center gap-2.5 text-[18px] font-bold font-outfit tracking-tight text-[#3D3532]">
        <div className="w-8 h-8 bg-gradient-to-br from-[#C4644A] to-[#A8523B] rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-[0_2px_8px_rgba(196,100,74,0.25)]">
          N
        </div>
        <span>Nordic<span className="text-[#C4644A]">Studio</span></span>
      </div>

      {/* Center: Cabinet selector + dims + steps */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <select
            value={currentCabinet}
            onChange={e => setCabinet(e.target.value as CabinetKey)}
            className="appearance-none border border-[#DDD7D1] bg-[#FAF8F5] px-4 py-2 pr-9 rounded-xl text-[13px] font-semibold text-[#3D3532] cursor-pointer outline-none focus:border-[#C4644A] focus:ring-2 focus:ring-[#C4644A]/10 font-[inherit] transition-all"
          >
            {(Object.keys(CABINETS) as CabinetKey[]).map(key => (
              <option key={key} value={key}>{CABINETS[key].label}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#A69E97] pointer-events-none">▾</span>
        </div>

        <span className="text-xs text-[#8A817A] bg-[#F5F2EE] px-3 py-1.5 rounded-xl font-medium tabular-nums">
          {formatDimensions(currentCabinet)}
        </span>

        {/* Steps — rounded organic pills */}
        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1.5 text-xs text-[#7B9E87] font-medium">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#7B9E87] text-white shadow-[0_2px_6px_rgba(123,158,135,0.25)]">✓</span>
            <span className="hidden sm:inline">Select</span>
          </div>
          <div className="w-5 h-px bg-[#DDD7D1]" />
          <div className="flex items-center gap-1.5 text-xs text-[#C4644A] font-semibold">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#C4644A] text-white shadow-[0_2px_6px_rgba(196,100,74,0.25)]">2</span>
            <span className="hidden sm:inline">Configure</span>
          </div>
          <div className="w-5 h-px bg-[#DDD7D1]" />
          <div className="flex items-center gap-1.5 text-xs text-[#C4BCB5] font-medium">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#DDD7D1] text-[#C4BCB5]">3</span>
            <span className="hidden sm:inline">Order</span>
          </div>
        </div>
      </div>

      {/* Right: Undo/Redo + Cart */}
      <div className="flex items-center gap-2">
        <button onClick={undo} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#8A817A] hover:bg-[#F5F2EE] hover:text-[#3D3532] transition-all">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M3 8L6.5 4.5M3 8L6.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Undo
        </button>
        <button onClick={redo} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#8A817A] hover:bg-[#F5F2EE] hover:text-[#3D3532] transition-all">
          Redo
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="relative p-2.5 rounded-xl text-[#8A817A] hover:bg-[#F5F2EE] hover:text-[#3D3532] transition-all">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {cartItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#C4644A] text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white shadow-[0_2px_6px_rgba(196,100,74,0.3)]">
              {cartItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
