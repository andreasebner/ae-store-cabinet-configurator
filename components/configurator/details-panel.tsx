'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { ELEMENT_PRICES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CircleDot, Square, RectangleHorizontal, Trash2, Mouse } from 'lucide-react';

export default function DetailsPanel() {
  const { selectedElId, currentElements, updateElementProp, deleteElement, currentSide, selectElement } = useConfiguratorStore();
  const els = currentElements();
  const el = selectedElId !== null ? els.find(e => e.id === selectedElId) : null;

  const handleChange = (prop: string, value: string) => {
    const n = Number(value);
    if (!isNaN(n) && el) updateElementProp(el.id, prop, n);
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Properties */}
      <div className="p-3 border-b border-slate-200">
        <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Properties</h3>
        {el ? (
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

      {/* Element list */}
      <div className="flex-1 overflow-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Elements</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
            {currentSide} · {els.length}
          </span>
        </div>

        {els.length === 0 ? (
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
                <span className="ml-auto font-mono text-[10px] text-slate-400">{item.x},{item.y}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
