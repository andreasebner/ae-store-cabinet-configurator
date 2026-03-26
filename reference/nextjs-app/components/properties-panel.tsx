'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { getPanelDimensions } from '@/lib/constants';

export default function PropertiesPanel() {
  const currentCabinet = useConfiguratorStore(s => s.currentCabinet);
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const selectedElId = useConfiguratorStore(s => s.selectedElId);
  const sideElements = useConfiguratorStore(s => s.sideElements);
  const updateElementProp = useConfiguratorStore(s => s.updateElementProp);

  const elements = sideElements[currentSide];
  const sel = elements.find(e => e.id === selectedElId);
  const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);

  if (!sel) {
    return (
      <div className="border-t border-gray-200 px-4 py-3 bg-white">
        <div className="text-center py-4 text-gray-400 text-xs">
          <div className="text-[28px] mb-1.5 opacity-40">◎</div>
          Click on the panel to place elements.<br/>Select a tool from the toolbar above.
        </div>
      </div>
    );
  }

  const typeName = sel.type === 'hole' ? 'Round Hole' : sel.type === 'rect' ? 'Rect Hole' : 'Cable Opening';
  // Convert pixel position to mm using canvas dimensions (340x400 canvas)
  const realX = (sel.x / 340 * pw).toFixed(1);
  const realY = (sel.y / 400 * ph).toFixed(1);

  return (
    <div className="border-t border-gray-200 px-4 py-3 bg-white max-h-[260px] overflow-y-auto">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
        Selected — {typeName}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">X</label>
          <input
            type="number"
            value={realX}
            step={1}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateElementProp(sel.id, 'x', Math.round(val / pw * 340));
            }}
            className="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 font-[inherit] tabular-nums"
          />
          <span className="text-[10px] text-gray-400 w-5">mm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">Y</label>
          <input
            type="number"
            value={realY}
            step={1}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateElementProp(sel.id, 'y', Math.round(val / ph * 400));
            }}
            className="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 font-[inherit] tabular-nums"
          />
          <span className="text-[10px] text-gray-400 w-5">mm</span>
        </div>
        {sel.type === 'hole' ? (
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">Ø</label>
            <input
              type="number"
              value={sel.diameter}
              min={4}
              max={200}
              step={1}
              onChange={e => updateElementProp(sel.id, 'diameter', parseInt(e.target.value) || 22)}
              className="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 font-[inherit] tabular-nums"
            />
            <span className="text-[10px] text-gray-400 w-5">mm</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">W</label>
              <input
                type="number"
                value={sel.w}
                min={10}
                max={500}
                step={5}
                onChange={e => updateElementProp(sel.id, 'w', parseInt(e.target.value) || 80)}
                className="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 font-[inherit] tabular-nums"
              />
              <span className="text-[10px] text-gray-400 w-5">mm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">H</label>
              <input
                type="number"
                value={sel.h}
                min={10}
                max={500}
                step={5}
                onChange={e => updateElementProp(sel.id, 'h', parseInt(e.target.value) || 40)}
                className="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 font-[inherit] tabular-nums"
              />
              <span className="text-[10px] text-gray-400 w-5">mm</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
