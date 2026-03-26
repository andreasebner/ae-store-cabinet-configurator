'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { getPanelDimensions } from '@/lib/constants';

export default function ElementList() {
  const currentCabinet = useConfiguratorStore(s => s.currentCabinet);
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const selectedElId = useConfiguratorStore(s => s.selectedElId);
  const sideElements = useConfiguratorStore(s => s.sideElements);
  const selectElement = useConfiguratorStore(s => s.selectElement);
  const deleteElement = useConfiguratorStore(s => s.deleteElement);

  const elements = sideElements[currentSide];
  const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);

  if (elements.length === 0) return null;

  return (
    <div className="px-4 pb-2">
      <div className="text-[10px] uppercase tracking-[0.15em] font-semibold my-2 font-chakra" style={{ color: 'var(--text-tertiary)' }}>
        Elements ({elements.length})
      </div>
      <ul className="space-y-0.5">
        {elements.map(el => {
          const rx = (el.x / 340 * pw).toFixed(0);
          const ry = (el.y / 400 * ph).toFixed(0);
          const name = el.type === 'hole' ? `Round Hole \u00D8${el.diameter}` : el.type === 'rect' ? `Rect Hole ${el.w}\u00D7${el.h}` : 'Cable Opening';

          const iconColors = el.type === 'hole'
            ? { bg: 'rgba(0, 229, 255, 0.08)', color: 'var(--cyan)', border: 'rgba(0, 229, 255, 0.15)' }
            : el.type === 'rect'
            ? { bg: 'rgba(166, 255, 0, 0.08)', color: 'var(--lime)', border: 'rgba(166, 255, 0, 0.15)' }
            : { bg: 'rgba(255, 61, 90, 0.08)', color: 'var(--red)', border: 'rgba(255, 61, 90, 0.15)' };

          const isSelected = el.id === selectedElId;

          return (
            <li
              key={el.id}
              onClick={() => selectElement(el.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all text-xs"
              style={isSelected ? {
                background: 'var(--cyan-subtle)',
                border: '1px solid rgba(0, 229, 255, 0.15)',
                boxShadow: '0 0 8px rgba(0, 229, 255, 0.08)',
              } : {
                background: 'transparent',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: iconColors.bg, color: iconColors.color, border: `1px solid ${iconColors.border}` }}
              >
                {el.type === 'hole' ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : el.type === 'rect' ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{name}</div>
                <div className="text-[10px] tabular-nums font-mono" style={{ color: 'var(--text-tertiary)' }}>X: {rx} Y: {ry}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                className="w-[22px] h-[22px] rounded flex items-center justify-center transition-all text-sm"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 61, 90, 0.1)';
                  e.currentTarget.style.color = 'var(--red)';
                  e.currentTarget.style.boxShadow = '0 0 6px rgba(255, 61, 90, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                &times;
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
