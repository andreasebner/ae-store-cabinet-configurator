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
    <header
      className="h-14 flex items-center justify-between px-5 z-50 relative"
      style={{
        background: 'linear-gradient(180deg, #111729 0%, #0D1220 100%)',
        borderBottom: '1px solid transparent',
        backgroundClip: 'padding-box',
      }}
    >
      {/* Bottom border with cyan gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.3) 20%, rgba(0, 229, 255, 0.5) 50%, rgba(0, 229, 255, 0.3) 80%, transparent)',
        }}
      />

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 flex items-center justify-center text-sm font-bold font-chakra"
          style={{
            background: 'linear-gradient(135deg, var(--cyan), #00B8CC)',
            color: 'var(--navy-base)',
            clipPath: 'polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)',
          }}
        >
          C
        </div>
        <span
          className="text-[17px] font-bold font-chakra tracking-wider"
          style={{
            color: 'var(--cyan)',
            textShadow: '0 0 20px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.1)',
          }}
        >
          CABINET<span style={{ color: 'var(--text-primary)' }}>PRO</span>
        </span>
      </div>

      {/* Center: Cabinet selector + dims + steps */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={currentCabinet}
            onChange={e => setCabinet(e.target.value as CabinetKey)}
            className="appearance-none px-3 py-1.5 pr-8 text-[13px] font-semibold cursor-pointer outline-none font-[inherit] transition-all"
            style={{
              background: 'var(--navy-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--cyan)';
              e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 229, 255, 0.2)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {(Object.keys(CABINETS) as CabinetKey[]).map(key => (
              <option key={key} value={key} style={{ background: 'var(--navy-surface)', color: 'var(--text-primary)' }}>
                {CABINETS[key].label}
              </option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none" style={{ color: 'var(--cyan-dim)' }}>
            &#x25BE;
          </span>
        </div>

        <span
          className="text-xs px-2.5 py-1 font-medium tabular-nums font-mono"
          style={{
            background: 'var(--cyan-subtle)',
            color: 'var(--cyan-dim)',
            border: '1px solid rgba(0, 229, 255, 0.1)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {formatDimensions(currentCabinet)}
        </span>

        {/* Steps - futuristic chevron style */}
        <div className="flex items-center gap-1 ml-2">
          {/* Step 1: Complete */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 flex items-center justify-center text-[10px] font-bold font-chakra"
              style={{
                background: 'var(--lime)',
                color: 'var(--navy-base)',
                clipPath: 'polygon(3px 0, calc(100% - 3px) 0, 100% 50%, calc(100% - 3px) 100%, 3px 100%, 0 50%)',
              }}
            >
              &#x2713;
            </div>
            <span className="text-[11px] font-semibold font-chakra" style={{ color: 'var(--lime)' }}>SELECT</span>
          </div>
          {/* Connector line */}
          <div className="w-6 h-px" style={{ background: 'linear-gradient(90deg, var(--lime), var(--cyan))' }} />
          {/* Step 2: Active */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 flex items-center justify-center text-[10px] font-bold font-chakra"
              style={{
                background: 'var(--cyan)',
                color: 'var(--navy-base)',
                clipPath: 'polygon(3px 0, calc(100% - 3px) 0, 100% 50%, calc(100% - 3px) 100%, 3px 100%, 0 50%)',
                boxShadow: '0 0 12px rgba(0, 229, 255, 0.4)',
              }}
            >
              2
            </div>
            <span className="text-[11px] font-semibold font-chakra" style={{ color: 'var(--cyan)' }}>CONFIG</span>
          </div>
          {/* Connector line */}
          <div className="w-6 h-px" style={{ background: 'linear-gradient(90deg, var(--cyan), var(--text-tertiary))' }} />
          {/* Step 3: Pending */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 flex items-center justify-center text-[10px] font-bold font-chakra"
              style={{
                background: 'transparent',
                color: 'var(--text-tertiary)',
                border: '1.5px solid var(--text-tertiary)',
                clipPath: 'polygon(3px 0, calc(100% - 3px) 0, 100% 50%, calc(100% - 3px) 100%, 3px 100%, 0 50%)',
              }}
            >
              3
            </div>
            <span className="text-[11px] font-semibold font-chakra" style={{ color: 'var(--text-tertiary)' }}>ORDER</span>
          </div>
        </div>
      </div>

      {/* Right: Undo/Redo + Cart */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={undo}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-[13px] font-medium transition-all"
          style={{ color: 'var(--text-secondary)', background: 'transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--cyan)';
            e.currentTarget.style.background = 'var(--cyan-subtle)';
            e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 229, 255, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M3 8L6.5 4.5M3 8L6.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Undo
        </button>
        <button
          onClick={redo}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-[13px] font-medium transition-all"
          style={{ color: 'var(--text-secondary)', background: 'transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--cyan)';
            e.currentTarget.style.background = 'var(--cyan-subtle)';
            e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 229, 255, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Redo
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button
          className="relative p-1.5 rounded transition-all"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--cyan)';
            e.currentTarget.style.background = 'var(--cyan-subtle)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {cartItems > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
              style={{
                background: 'var(--cyan)',
                color: 'var(--navy-base)',
                border: '2px solid var(--navy-surface)',
                boxShadow: '0 0 6px rgba(0, 229, 255, 0.4)',
              }}
            >
              {cartItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
