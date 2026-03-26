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
      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold my-2">
        Elements ({elements.length})
      </div>
      <ul className="space-y-0.5">
        {elements.map(el => {
          const rx = (el.x / 340 * pw).toFixed(0);
          const ry = (el.y / 400 * ph).toFixed(0);
          const name = el.type === 'hole' ? `Round Hole Ø${el.diameter}` : el.type === 'rect' ? `Rect Hole ${el.w}×${el.h}` : 'Cable Opening';
          const iconColor = el.type === 'hole' ? 'bg-indigo-500/[0.08] text-indigo-500' : el.type === 'rect' ? 'bg-amber-500/[0.08] text-amber-700' : 'bg-red-500/[0.08] text-red-500';

          return (
            <li
              key={el.id}
              onClick={() => selectElement(el.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-xs
                ${el.id === selectedElId ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
            >
              <div className={`w-6 h-6 rounded-[5px] flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                {el.type === 'hole' ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : el.type === 'rect' ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs">{name}</div>
                <div className="text-[10px] text-gray-400 tabular-nums">X: {rx} Y: {ry}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                className="w-[22px] h-[22px] rounded flex items-center justify-center text-gray-400 hover:bg-red-500/[0.08] hover:text-red-500 transition-all text-sm"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
