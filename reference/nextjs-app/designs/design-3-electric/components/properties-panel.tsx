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
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--navy-surface)' }}>
        <div className="text-center py-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <div className="text-[28px] mb-1.5 opacity-40" style={{ color: 'var(--cyan)', textShadow: '0 0 12px rgba(0, 229, 255, 0.2)' }}>
            &#x25CE;
          </div>
          Click on the panel to place elements.<br/>Select a tool from the toolbar above.
        </div>
      </div>
    );
  }

  const typeName = sel.type === 'hole' ? 'Round Hole' : sel.type === 'rect' ? 'Rect Hole' : 'Cable Opening';
  const realX = (sel.x / 340 * pw).toFixed(1);
  const realY = (sel.y / 400 * ph).toFixed(1);

  const inputStyle: React.CSSProperties = {
    background: 'var(--navy-base)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--cyan)';
    e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 229, 255, 0.2), inset 0 0 4px rgba(0, 229, 255, 0.05)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="px-4 py-3 max-h-[260px] overflow-y-auto" style={{ borderTop: '1px solid var(--border)', background: 'var(--navy-surface)' }}>
      <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2 font-chakra" style={{ color: 'var(--text-tertiary)' }}>
        Selected &mdash; {typeName}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] w-5 flex-shrink-0 font-medium font-chakra" style={{ color: 'var(--cyan-dim)' }}>X</label>
          <input
            type="number"
            value={realX}
            step={1}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateElementProp(sel.id, 'x', Math.round(val / pw * 340));
            }}
            className="flex-1 h-7 px-2 text-xs tabular-nums transition-all"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <span className="text-[10px] w-5 font-chakra" style={{ color: 'var(--text-tertiary)' }}>mm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] w-5 flex-shrink-0 font-medium font-chakra" style={{ color: 'var(--cyan-dim)' }}>Y</label>
          <input
            type="number"
            value={realY}
            step={1}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateElementProp(sel.id, 'y', Math.round(val / ph * 400));
            }}
            className="flex-1 h-7 px-2 text-xs tabular-nums transition-all"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <span className="text-[10px] w-5 font-chakra" style={{ color: 'var(--text-tertiary)' }}>mm</span>
        </div>
        {sel.type === 'hole' ? (
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] w-5 flex-shrink-0 font-medium font-chakra" style={{ color: 'var(--cyan-dim)' }}>&Oslash;</label>
            <input
              type="number"
              value={sel.diameter}
              min={4}
              max={200}
              step={1}
              onChange={e => updateElementProp(sel.id, 'diameter', parseInt(e.target.value) || 22)}
              className="flex-1 h-7 px-2 text-xs tabular-nums transition-all"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <span className="text-[10px] w-5 font-chakra" style={{ color: 'var(--text-tertiary)' }}>mm</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] w-5 flex-shrink-0 font-medium font-chakra" style={{ color: 'var(--cyan-dim)' }}>W</label>
              <input
                type="number"
                value={sel.w}
                min={10}
                max={500}
                step={5}
                onChange={e => updateElementProp(sel.id, 'w', parseInt(e.target.value) || 80)}
                className="flex-1 h-7 px-2 text-xs tabular-nums transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <span className="text-[10px] w-5 font-chakra" style={{ color: 'var(--text-tertiary)' }}>mm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] w-5 flex-shrink-0 font-medium font-chakra" style={{ color: 'var(--cyan-dim)' }}>H</label>
              <input
                type="number"
                value={sel.h}
                min={10}
                max={500}
                step={5}
                onChange={e => updateElementProp(sel.id, 'h', parseInt(e.target.value) || 40)}
                className="flex-1 h-7 px-2 text-xs tabular-nums transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <span className="text-[10px] w-5 font-chakra" style={{ color: 'var(--text-tertiary)' }}>mm</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
