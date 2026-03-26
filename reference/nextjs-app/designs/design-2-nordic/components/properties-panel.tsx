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
      <div className="border-t border-[#EDE8E3] px-5 py-4 bg-white">
        <div className="text-center py-5 text-[#A69E97] text-xs">
          <div className="text-[28px] mb-2 opacity-30">&#9678;</div>
          <span className="leading-relaxed">Click on the panel to place elements.<br/>Select a tool from the toolbar above.</span>
        </div>
      </div>
    );
  }

  const typeName = sel.type === 'hole' ? 'Round Hole' : sel.type === 'rect' ? 'Rect Hole' : 'Cable Opening';
  const realX = (sel.x / 340 * pw).toFixed(1);
  const realY = (sel.y / 400 * ph).toFixed(1);

  const inputClasses = "flex-1 h-8 border border-[#DDD7D1] rounded-xl px-2.5 text-xs text-[#3D3532] bg-[#FAF8F5] outline-none focus:border-[#C4644A] focus:ring-2 focus:ring-[#C4644A]/10 font-[inherit] tabular-nums transition-all";

  return (
    <div className="border-t border-[#EDE8E3] px-5 py-4 bg-white max-h-[260px] overflow-y-auto">
      <div className="text-[10px] uppercase tracking-wider text-[#A69E97] font-semibold mb-3 font-outfit">
        Selected — {typeName}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-[#8A817A] w-5 flex-shrink-0 font-semibold">X</label>
          <input
            type="number"
            value={realX}
            step={1}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateElementProp(sel.id, 'x', Math.round(val / pw * 340));
            }}
            className={inputClasses}
          />
          <span className="text-[10px] text-[#C4BCB5] w-5 font-medium">mm</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-[#8A817A] w-5 flex-shrink-0 font-semibold">Y</label>
          <input
            type="number"
            value={realY}
            step={1}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateElementProp(sel.id, 'y', Math.round(val / ph * 400));
            }}
            className={inputClasses}
          />
          <span className="text-[10px] text-[#C4BCB5] w-5 font-medium">mm</span>
        </div>
        {sel.type === 'hole' ? (
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-[#8A817A] w-5 flex-shrink-0 font-semibold">&#x2300;</label>
            <input
              type="number"
              value={sel.diameter}
              min={4}
              max={200}
              step={1}
              onChange={e => updateElementProp(sel.id, 'diameter', parseInt(e.target.value) || 22)}
              className={inputClasses}
            />
            <span className="text-[10px] text-[#C4BCB5] w-5 font-medium">mm</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#8A817A] w-5 flex-shrink-0 font-semibold">W</label>
              <input
                type="number"
                value={sel.w}
                min={10}
                max={500}
                step={5}
                onChange={e => updateElementProp(sel.id, 'w', parseInt(e.target.value) || 80)}
                className={inputClasses}
              />
              <span className="text-[10px] text-[#C4BCB5] w-5 font-medium">mm</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#8A817A] w-5 flex-shrink-0 font-semibold">H</label>
              <input
                type="number"
                value={sel.h}
                min={10}
                max={500}
                step={5}
                onChange={e => updateElementProp(sel.id, 'h', parseInt(e.target.value) || 40)}
                className={inputClasses}
              />
              <span className="text-[10px] text-[#C4BCB5] w-5 font-medium">mm</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
