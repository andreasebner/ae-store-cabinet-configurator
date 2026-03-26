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
    <div className="px-5 pb-3">
      <div className="text-[10px] uppercase tracking-wider text-[#A69E97] font-semibold my-2.5 font-outfit">
        Elements ({elements.length})
      </div>
      <ul className="space-y-1">
        {elements.map(el => {
          const rx = (el.x / 340 * pw).toFixed(0);
          const ry = (el.y / 400 * ph).toFixed(0);
          const name = el.type === 'hole' ? `Round Hole \u00D8${el.diameter}` : el.type === 'rect' ? `Rect Hole ${el.w}\u00D7${el.h}` : 'Cable Opening';
          const iconColor = el.type === 'hole'
            ? 'bg-[#F3E0DA] text-[#C4644A]'
            : el.type === 'rect'
            ? 'bg-[#E3EDE6] text-[#7B9E87]'
            : 'bg-[#F5DDDB] text-[#C96156]';

          return (
            <li
              key={el.id}
              onClick={() => selectElement(el.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all text-xs
                ${el.id === selectedElId ? 'bg-[#F3E0DA]/60' : 'hover:bg-[#F5F2EE]'}`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                {el.type === 'hole' ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : el.type === 'rect' ? (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                ) : (
                  <svg viewBox="0 0 14 14" fill="none" className="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-[#3D3532]">{name}</div>
                <div className="text-[10px] text-[#A69E97] tabular-nums">X: {rx} Y: {ry}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#C4BCB5] hover:bg-[#F5DDDB] hover:text-[#C96156] transition-all text-sm"
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
