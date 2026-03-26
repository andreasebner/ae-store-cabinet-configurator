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
      <div className="border-t border-[#3A3F4A] px-4 py-3 bg-[#22262E]">
        <div className="text-center py-4 text-[#4B5563] text-xs">
          <div className="text-[28px] mb-1.5 opacity-30">&#9678;</div>
          <span className="font-mono text-[10px] uppercase tracking-wider">
            Click on the panel to place elements.<br/>Select a tool from the toolbar above.
          </span>
        </div>
      </div>
    );
  }

  const typeName = sel.type === 'hole' ? 'Round Hole' : sel.type === 'rect' ? 'Rect Hole' : 'Cable Opening';
  const realX = (sel.x / 340 * pw).toFixed(1);
  const realY = (sel.y / 400 * ph).toFixed(1);

  return (
    <div className="border-t border-[#3A3F4A] px-4 py-3 bg-[#22262E] max-h-[260px] overflow-y-auto">
      <div className="text-[9px] uppercase tracking-[0.15em] text-[#6B7280] font-bold mb-2 font-mono flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-sm bg-[#FF6B2C]" />
        Selected &mdash; {typeName}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-[#6B7280] w-5 flex-shrink-0 font-bold font-mono">X</label>
          <input
            type="number"
            value={realX}
            step={1}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateElementProp(sel.id, 'x', Math.round(val / pw * 340));
            }}
            className="forge-input flex-1 h-7 px-2 tabular-nums"
          />
          <span className="text-[9px] text-[#4B5563] w-5 font-mono font-bold">mm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-[#6B7280] w-5 flex-shrink-0 font-bold font-mono">Y</label>
          <input
            type="number"
            value={realY}
            step={1}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateElementProp(sel.id, 'y', Math.round(val / ph * 400));
            }}
            className="forge-input flex-1 h-7 px-2 tabular-nums"
          />
          <span className="text-[9px] text-[#4B5563] w-5 font-mono font-bold">mm</span>
        </div>
        {sel.type === 'hole' ? (
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-[#6B7280] w-5 flex-shrink-0 font-bold font-mono">&Oslash;</label>
            <input
              type="number"
              value={sel.diameter}
              min={4}
              max={200}
              step={1}
              onChange={e => updateElementProp(sel.id, 'diameter', parseInt(e.target.value) || 22)}
              className="forge-input flex-1 h-7 px-2 tabular-nums"
            />
            <span className="text-[9px] text-[#4B5563] w-5 font-mono font-bold">mm</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-[#6B7280] w-5 flex-shrink-0 font-bold font-mono">W</label>
              <input
                type="number"
                value={sel.w}
                min={10}
                max={500}
                step={5}
                onChange={e => updateElementProp(sel.id, 'w', parseInt(e.target.value) || 80)}
                className="forge-input flex-1 h-7 px-2 tabular-nums"
              />
              <span className="text-[9px] text-[#4B5563] w-5 font-mono font-bold">mm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-[#6B7280] w-5 flex-shrink-0 font-bold font-mono">H</label>
              <input
                type="number"
                value={sel.h}
                min={10}
                max={500}
                step={5}
                onChange={e => updateElementProp(sel.id, 'h', parseInt(e.target.value) || 40)}
                className="forge-input flex-1 h-7 px-2 tabular-nums"
              />
              <span className="text-[9px] text-[#4B5563] w-5 font-mono font-bold">mm</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
