'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { SIDES } from '@/lib/constants';
import { Side } from '@/lib/types';

export default function SidePills() {
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const setSide = useConfiguratorStore(s => s.setSide);
  const sideElements = useConfiguratorStore(s => s.sideElements);

  return (
    <div className="px-4 pb-3" style={{ background: '#080C16' }}>
      <div className="flex gap-1.5 justify-center">
        {SIDES.map(side => {
          const hasEdits = sideElements[side].length > 0;
          const isActive = side === currentSide;
          return (
            <button
              key={side}
              onClick={() => setSide(side)}
              className="relative px-3.5 py-1 text-xs font-semibold transition-all font-chakra uppercase tracking-wider"
              style={isActive ? {
                background: 'var(--cyan)',
                color: 'var(--navy-base)',
                borderRadius: '3px',
                border: '1px solid var(--cyan)',
                boxShadow: '0 0 12px rgba(0, 229, 255, 0.3), 0 0 24px rgba(0, 229, 255, 0.1)',
              } : {
                background: 'var(--navy-surface)',
                color: 'var(--text-secondary)',
                borderRadius: '3px',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
                  e.currentTarget.style.color = 'var(--cyan)';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 229, 255, 0.1)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {side.charAt(0).toUpperCase() + side.slice(1)}
              {hasEdits && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full"
                  style={{
                    background: 'var(--lime)',
                    border: '1.5px solid #080C16',
                    boxShadow: '0 0 4px rgba(166, 255, 0, 0.5)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-center pt-1.5 pb-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        Click a side or drag to rotate
      </p>
    </div>
  );
}
