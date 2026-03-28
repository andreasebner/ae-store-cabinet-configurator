'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { ELEMENT_PRICES, getPanelDimensions } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { AnchorPoint, BorderRef } from '@/lib/types';
import { CircleDot, Square, RectangleHorizontal, Trash2, Mouse, Grid3X3, Link } from 'lucide-react';

const ANCHOR_OPTIONS: { key: AnchorPoint; label: string; pos: string }[] = [
  { key: 'top-left', label: 'TL', pos: 'top-0 left-0' },
  { key: 'top-right', label: 'TR', pos: 'top-0 right-0' },
  { key: 'center', label: 'C', pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  { key: 'bottom-left', label: 'BL', pos: 'bottom-0 left-0' },
  { key: 'bottom-right', label: 'BR', pos: 'bottom-0 right-0' },
];

export default function DetailsPanel() {
  const { selectedElId, currentElements, updateElementProp, deleteElement, currentSide, selectElement, currentCabinet } = useConfiguratorStore();
  const selectedAlignId = useConfiguratorStore(s => s.selectedAlignId);
  const currentAlignments = useConfiguratorStore(s => s.currentAlignments);
  const updateAlignmentProp = useConfiguratorStore(s => s.updateAlignmentProp);
  const deleteAlignment = useConfiguratorStore(s => s.deleteAlignment);
  const selectedConstraintId = useConfiguratorStore(s => s.selectedConstraintId);
  const currentConstraints = useConfiguratorStore(s => s.currentConstraints);
  const updateConstraintValue = useConfiguratorStore(s => s.updateConstraintValue);
  const deleteConstraint = useConfiguratorStore(s => s.deleteConstraint);
  const selectConstraint = useConfiguratorStore(s => s.selectConstraint);
  const els = currentElements();
  const aligns = currentAlignments();
  const constraints = currentConstraints();
  const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);
  const el = selectedElId !== null ? els.find(e => e.id === selectedElId) : null;
  const selectedAlign = selectedAlignId !== null ? aligns.find(a => a.id === selectedAlignId) : null;
  const selectedConstraint = selectedConstraintId !== null ? constraints.find(c => c.id === selectedConstraintId) : null;

  const handleChange = (prop: string, value: string) => {
    if (prop === 'anchor') {
      if (el) updateElementProp(el.id, prop, value);
      return;
    }
    const n = Number(value);
    if (!isNaN(n) && el) updateElementProp(el.id, prop, n);
  };

  const handleAlignChange = (prop: string, value: string) => {
    const n = Number(value);
    if (!isNaN(n) && selectedAlign) updateAlignmentProp(selectedAlign.id, prop, n);
  };

  const typeIcon = (type: string, size = 'h-3.5 w-3.5') => {
    switch (type) {
      case 'hole': return <CircleDot className={cn(size, 'text-amber-500')} />;
      case 'rect': return <Square className={cn(size, 'text-sky-500')} />;
      case 'opening': return <RectangleHorizontal className={cn(size, 'text-emerald-500')} />;
      default: return null;
    }
  };

  const typeBg = (type: string) => {
    switch (type) {
      case 'hole': return 'bg-amber-50 border-amber-200';
      case 'rect': return 'bg-sky-50 border-sky-200';
      case 'opening': return 'bg-emerald-50 border-emerald-200';
      default: return '';
    }
  };

  const refLabel = (ref: number | BorderRef) => {
    if (typeof ref === 'string') {
      if (ref === 'border-left') return 'Left Border';
      if (ref === 'border-right') return 'Right Border';
      if (ref === 'border-bottom') return 'Bottom Border';
      return ref;
    }
    const el = els.find(e => e.id === ref);
    return el ? `${el.type} #${el.id}` : `#${ref}`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Properties */}
      <div className="p-3 border-b border-slate-200">
        <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Properties</h3>
        {selectedConstraint ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 rounded border bg-orange-50 border-orange-200">
              <Link className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Distance Constraint</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">From</label>
                <div className="h-7 flex items-center text-xs px-2 bg-slate-50 border border-slate-200 rounded text-slate-600">
                  {refLabel(selectedConstraint.fromRef)}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">To</label>
                <div className="h-7 flex items-center text-xs px-2 bg-slate-50 border border-slate-200 rounded text-slate-600">
                  {refLabel(selectedConstraint.toRef)}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Axis</label>
                <div className="h-7 flex items-center text-xs px-2 bg-slate-50 border border-slate-200 rounded text-slate-600 uppercase">
                  {selectedConstraint.axis}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Distance (mm)</label>
                <input type="number" step={5} min={0} value={selectedConstraint.value}
                  onChange={e => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) updateConstraintValue(selectedConstraint.id, v, pw, ph);
                  }}
                  className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-orange-500 outline-none" />
              </div>
            </div>

            <button
              onClick={() => deleteConstraint(selectedConstraint.id)}
              className="w-full flex items-center justify-center gap-1.5 h-7 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded transition"
            >
              <Trash2 className="h-3 w-3" />
              Delete Constraint
            </button>
          </div>
        ) : selectedAlign ? (
          <div className="space-y-3">
            <div className={cn('flex items-center gap-2 p-2 rounded border',
              selectedAlign.type === 'align-circular' ? 'bg-purple-50 border-purple-200' : 'bg-cyan-50 border-cyan-200'
            )}>
              {selectedAlign.type === 'align-circular'
                ? <CircleDot className="h-4 w-4 text-purple-500" />
                : <Grid3X3 className="h-4 w-4 text-cyan-500" />}
              <span className="text-sm font-medium">{selectedAlign.type === 'align-circular' ? 'Circular' : 'Rectangular'} Alignment</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">X (mm)</label>
                <input type="number" step={5} value={selectedAlign.x}
                  onChange={e => handleAlignChange('x', e.target.value)}
                  className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Y (mm)</label>
                <input type="number" step={5} value={selectedAlign.y}
                  onChange={e => handleAlignChange('y', e.target.value)}
                  className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
              </div>

              {selectedAlign.type === 'align-circular' ? (
                <>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Diameter (mm)</label>
                    <input type="number" step={5} min={10} value={selectedAlign.diameter}
                      onChange={e => handleAlignChange('diameter', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Count</label>
                    <input type="number" step={1} min={2} value={selectedAlign.count}
                      onChange={e => handleAlignChange('count', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Rows</label>
                    <input type="number" step={1} min={1} value={selectedAlign.rows}
                      onChange={e => handleAlignChange('rows', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Columns</label>
                    <input type="number" step={1} min={1} value={selectedAlign.cols}
                      onChange={e => handleAlignChange('cols', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">X Distance</label>
                    <input type="number" step={5} min={10} value={selectedAlign.spacingX}
                      onChange={e => handleAlignChange('spacingX', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Y Distance</label>
                    <input type="number" step={5} min={10} value={selectedAlign.spacingY}
                      onChange={e => handleAlignChange('spacingY', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => deleteAlignment(selectedAlign.id)}
              className="w-full flex items-center justify-center gap-1.5 h-7 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded transition"
            >
              <Trash2 className="h-3 w-3" />
              Delete Alignment
            </button>
          </div>
        ) : el ? (
          <div className="space-y-3">
            <div className={cn('flex items-center gap-2 p-2 rounded border', typeBg(el.type))}>
              {typeIcon(el.type, 'h-4 w-4')}
              <span className="text-sm font-medium capitalize">{el.type}</span>
              <span className="ml-auto text-xs text-slate-500">€{ELEMENT_PRICES[el.type]?.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">X (mm)</label>
                <input type="number" step={5} min={0} value={el.x}
                  onChange={e => handleChange('x', e.target.value)}
                  className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Y (mm)</label>
                <input type="number" step={5} min={0} value={el.y}
                  onChange={e => handleChange('y', e.target.value)}
                  className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
              </div>
              {el.type === 'hole' ? (
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Diameter (mm)</label>
                  <input type="number" step={1} min={5} value={el.diameter ?? Math.round(el.w * 22 / 36)}
                    onChange={e => handleChange('diameter', e.target.value)}
                    className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Width</label>
                    <input type="number" step={1} min={5} value={el.w}
                      onChange={e => handleChange('w', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Height</label>
                    <input type="number" step={1} min={5} value={el.h}
                      onChange={e => handleChange('h', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                </>
              )}

              {/* Rect-only: Anchor + Radius */}
              {el.type === 'rect' && (
                <>
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">Anchor Point</label>
                    <div className="relative w-16 h-12 border border-slate-200 rounded bg-slate-50 mx-auto">
                      {ANCHOR_OPTIONS.map(a => (
                        <button
                          key={a.key}
                          onClick={() => updateElementProp(el.id, 'anchor', a.key as any)}
                          title={a.key}
                          className={cn(
                            'absolute w-3.5 h-3.5 rounded-full border-2 transition-colors',
                            a.pos,
                            (el.anchor ?? 'center') === a.key
                              ? 'bg-brand-500 border-brand-600 scale-110'
                              : 'bg-white border-slate-300 hover:border-brand-400'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Edge Radius (mm)</label>
                    <input type="number" step={1} min={3} value={el.radius ?? 3}
                      onChange={e => handleChange('radius', e.target.value)}
                      className="w-full h-7 text-xs px-2 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => deleteElement(el.id)}
              className="w-full flex items-center justify-center gap-1.5 h-7 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded transition"
            >
              <Trash2 className="h-3 w-3" />
              Delete Element
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <Mouse className="h-5 w-5 text-slate-300 mb-1.5" />
            <p className="text-xs text-slate-400">Select an element to edit</p>
          </div>
        )}
      </div>

      {/* Element & Alignment list */}
      <div className="flex-1 overflow-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Elements</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
            {currentSide} · {els.length + aligns.length + constraints.length}
          </span>
        </div>

        {/* Alignments */}
        {aligns.length > 0 && (
          <div className="space-y-0.5 mb-1">
            {aligns.map(a => (
              <button
                key={`al-${a.id}`}
                className={cn(
                  'w-full flex items-center gap-2 h-7 px-2 rounded text-xs transition-colors text-left',
                  selectedAlignId === a.id
                    ? (a.type === 'align-circular' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-cyan-50 text-cyan-700 border border-cyan-200')
                    : 'hover:bg-slate-50 text-slate-600'
                )}
                onClick={() => useConfiguratorStore.getState().selectAlignment(a.id)}
              >
                {a.type === 'align-circular' ? <CircleDot className="h-3.5 w-3.5 text-purple-500" /> : <Grid3X3 className="h-3.5 w-3.5 text-cyan-500" />}
                <span>{a.type === 'align-circular' ? 'Circular' : 'Rect'}</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">
                  {a.type === 'align-circular' ? `⌀${a.diameter} ×${a.count}` : `${a.rows}×${a.cols}`}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Constraints */}
        {constraints.length > 0 && (
          <div className="space-y-0.5 mb-1">
            {constraints.map(c => (
              <button
                key={`con-${c.id}`}
                className={cn(
                  'w-full flex items-center gap-2 h-7 px-2 rounded text-xs transition-colors text-left',
                  selectedConstraintId === c.id
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : 'hover:bg-slate-50 text-slate-600'
                )}
                onClick={() => selectConstraint(c.id)}
              >
                <Link className="h-3.5 w-3.5 text-orange-500" />
                <span className="truncate">{typeof c.fromRef === 'string' ? c.fromRef.replace('border-', '') : `#${c.fromRef}`} → #{c.toRef}</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">
                  {Math.round(c.value)}mm
                </span>
              </button>
            ))}
          </div>
        )}

        {els.length === 0 && aligns.length === 0 && constraints.length === 0 ? (
          <p className="text-xs text-slate-400 mt-3 text-center">
            No elements yet.<br />Select a tool and click the panel.
          </p>
        ) : (
          <div className="space-y-0.5">
            {els.map(item => (
              <button
                key={item.id}
                className={cn(
                  'w-full flex items-center gap-2 h-7 px-2 rounded text-xs transition-colors text-left',
                  selectedElId === item.id
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'hover:bg-slate-50 text-slate-600'
                )}
                onClick={() => selectElement(item.id)}
              >
                {typeIcon(item.type)}
                <span className="capitalize">{item.type}</span>
                <span className="ml-auto font-mono text-[10px] text-slate-400">
                  {item.type === 'hole' ? `⌀${item.diameter ?? Math.round(item.w * 22 / 36)}` : `${item.x},${item.y}`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
