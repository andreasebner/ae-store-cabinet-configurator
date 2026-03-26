'use client';

import { useRef, useCallback } from 'react';
import { useConfiguratorStore } from '@/lib/configurator-store';
import { CABINETS, getPanelDimensions, formatDimensions, SNAP_GRID } from '@/lib/constants';
import type { PanelElement, ElementType } from '@/lib/types';

const SCALE = 0.65;

export function PanelEditor() {
  const store = useConfiguratorStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const dims = getPanelDimensions(store.currentCabinet, store.currentSide);
  const dimsLabel = formatDimensions(store.currentCabinet, store.currentSide);

  const onPanelClick = useCallback((e: React.MouseEvent) => {
    if (store.activeTool === 'move') { store.selectElement(null); return; }
    const surface = panelRef.current?.querySelector('.panel-surface') as HTMLElement;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    const x = (e.clientX - rect.left) / SCALE / store.zoomLevel;
    const y = (e.clientY - rect.top) / SCALE / store.zoomLevel;
    store.addElement(store.activeTool as ElementType, x, y, dims.w, dims.h);
  }, [store, dims]);

  const dragRef = useRef<{ id: number; ox: number; oy: number } | null>(null);

  const startDrag = (el: PanelElement, e: React.MouseEvent) => {
    if (store.activeTool !== 'move') return;
    e.stopPropagation();
    store.selectElement(el.id);
    dragRef.current = { id: el.id, ox: e.clientX - el.x * SCALE, oy: e.clientY - el.y * SCALE };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      store.moveElement(dragRef.current.id, (ev.clientX - dragRef.current.ox) / SCALE, (ev.clientY - dragRef.current.oy) / SCALE);
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={panelRef}
      className="flex-1 relative overflow-hidden grid-dots bg-base-200"
      style={{ cursor: store.activeTool === 'move' ? 'grab' : 'crosshair' }}
      onClick={onPanelClick}
    >
      {/* Panel surface */}
      <div
        className="panel-surface absolute bg-white shadow-lg border border-base-300"
        style={{
          width: dims.w * SCALE, height: dims.h * SCALE,
          top: '50%', left: '50%',
          translate: '-50% -50%',
          transform: `scale(${store.zoomLevel})`,
          transformOrigin: 'center',
        }}
      >
        {store.sideElements[store.currentSide].map(el => (
          <div
            key={el.id}
            className={`panel-el ${el.id === store.selectedElId ? 'selected' : ''}`}
            style={{
              left: el.x * SCALE, top: el.y * SCALE,
              width: el.w * SCALE, height: el.h * SCALE,
              borderRadius: el.type === 'hole' ? '50%' : undefined,
            }}
            onClick={e => { e.stopPropagation(); store.selectElement(el.id); }}
            onMouseDown={e => startDrag(el, e)}
          >
            {el.type === 'hole' && (
              <div className="w-3/5 h-3/5 m-[20%] rounded-full bg-primary/20" />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="badge badge-sm badge-ghost absolute bottom-2 left-2 font-mono">{dimsLabel}</div>
      <div className="badge badge-sm badge-ghost absolute bottom-2 right-2 capitalize">🔄 {store.currentSide}</div>
    </div>
  );
}
