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
    <header className="h-[52px] bg-[#1A1D23] border-b-2 border-[#3A3F4A] flex items-center justify-between px-5 z-50">
      {/* Logo — Industrial style */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#FF6B2C] rounded-sm flex items-center justify-center text-white text-sm font-bold font-mono tracking-tighter shadow-[0_0_12px_rgba(255,107,44,0.3)]">
          CP
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold text-[#E8EAED] tracking-tight">
            Cabinet<span className="text-[#FF6B2C]">Pro</span>
          </span>
          <span className="text-[9px] text-[#6B7280] font-mono uppercase tracking-[0.2em]">Configurator</span>
        </div>
      </div>

      {/* Center: Cabinet selector + dims + steps */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={currentCabinet}
            onChange={e => setCabinet(e.target.value as CabinetKey)}
            className="forge-select appearance-none px-3 py-1.5 pr-8 text-[13px] font-semibold cursor-pointer"
          >
            {(Object.keys(CABINETS) as CabinetKey[]).map(key => (
              <option key={key} value={key}>{CABINETS[key].label}</option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280] pointer-events-none">▾</span>
        </div>

        <span className="text-[11px] text-[#9DA3AE] bg-[#2A2F38] px-2.5 py-1 rounded-sm font-mono tabular-nums border border-[#3A3F4A]">
          {formatDimensions(currentCabinet)}
        </span>

        {/* Steps — Industrial orange tones */}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="flex items-center gap-1 text-[11px] text-[#27AE60] font-medium">
            <span className="w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold bg-[#27AE60] text-white border-[1.5px] border-[#27AE60]">&#10003;</span>
            <span className="font-mono text-[10px] uppercase tracking-wider">Select</span>
          </div>
          <span className="text-[#3A3F4A] text-[10px] font-mono">&gt;</span>
          <div className="flex items-center gap-1 text-[11px] text-[#FF6B2C] font-medium">
            <span className="w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold bg-[#FF6B2C] text-white border-[1.5px] border-[#FF6B2C]">2</span>
            <span className="font-mono text-[10px] uppercase tracking-wider">Configure</span>
          </div>
          <span className="text-[#3A3F4A] text-[10px] font-mono">&gt;</span>
          <div className="flex items-center gap-1 text-[11px] text-[#4B5563] font-medium">
            <span className="w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold border-[1.5px] border-[#3A3F4A] text-[#4B5563]">3</span>
            <span className="font-mono text-[10px] uppercase tracking-wider">Order</span>
          </div>
        </div>
      </div>

      {/* Right: Undo/Redo + Cart */}
      <div className="flex items-center gap-1">
        <button onClick={undo} className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-[12px] font-medium text-[#6B7280] hover:bg-[#2A2F38] hover:text-[#E8EAED] transition-all border border-transparent hover:border-[#3A3F4A]">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M3 8L6.5 4.5M3 8L6.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="font-mono text-[10px] uppercase tracking-wider">Undo</span>
        </button>
        <button onClick={redo} className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-[12px] font-medium text-[#6B7280] hover:bg-[#2A2F38] hover:text-[#E8EAED] transition-all border border-transparent hover:border-[#3A3F4A]">
          <span className="font-mono text-[10px] uppercase tracking-wider">Redo</span>
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="w-px h-5 bg-[#3A3F4A] mx-1" />
        <button className="relative p-1.5 rounded-sm text-[#6B7280] hover:bg-[#2A2F38] hover:text-[#FF6B2C] transition-all border border-transparent hover:border-[#3A3F4A]">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {cartItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#FF6B2C] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-sm border-2 border-[#1A1D23] font-mono">
              {cartItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
