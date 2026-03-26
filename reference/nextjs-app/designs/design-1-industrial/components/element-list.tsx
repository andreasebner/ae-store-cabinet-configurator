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
      <div className="text-[9px] uppercase tracking-[0.15em] text-[#4B5563] font-bold my-2 font-mono flex items-center gap-2">
        <span className="flex-1 h-px bg-[#3A3F4A]" />
        Elements ({elements.length})
        <span className="flex-1 h-px bg-[#3A3F4A]" />
      </div>
      <ul className="space-y-0.5">
        {elements.map(el => {
          const rx = (el.x / 340 * pw).toFixed(0);
          const ry = (el.y / 400 * ph).toFixed(0);
          const name = el.type === 'hole' ? `Round Hole \u00D8${el.diameter}` : el.type === 'rect' ? `Rect Hole ${el.w}\u00D7${el.h}` : 'Cable Opening';
          const iconColor = el.type === 'hole'
            ? 'bg-[#FF6B2C]/10 text-[#FF6B2C]'
            : el.type === 'rect'
              ? 'bg-[#F5A623]/10 text-[#F5A623]'
              : 'bg-[#E74C3C]/10 text-[#E74C3C]';

          return (
            <li
              key={el.id}
              onClick={() => selectElement(el.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors text-xs border
                ${el.id === selectedElId
                  ? 'bg-[#FF6B2C]/8 border-[#FF6B2C]/20'
                  : 'border-transparent hover:bg-[#2A2F38] hover:border-[#3A3F4A]'}`}
            >
              <div className={`w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                {el.type === 'hole' ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : el.type === 'rect' ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs text-[#E8EAED]">{name}</div>
                <div className="text-[10px] text-[#4B5563] tabular-nums font-mono">X: {rx} Y: {ry}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                className="w-[22px] h-[22px] rounded-sm flex items-center justify-center text-[#4B5563] hover:bg-[#E74C3C]/10 hover:text-[#E74C3C] transition-all text-sm border border-transparent hover:border-[#E74C3C]/20"
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
