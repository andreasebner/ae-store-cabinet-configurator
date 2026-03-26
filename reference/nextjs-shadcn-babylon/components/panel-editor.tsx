'use client';

import { useRef, useCallback } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { getPanelDimensions, snap, SNAP_GRID } from '@/lib/constants';
import type { ElementType } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function PanelEditor() {
  const {
    currentCabinet, currentSide, activeTool, zoomLevel, selectedElId,
    addElement, moveElement, selectElement, currentElements,
  } = useConfiguratorStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: number; ox: number; oy: number } | null>(null);

  const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);
  const els = currentElements();

  const handlePanelClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'move') { selectElement(null); return; }
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    addElement(activeTool as ElementType, x, y, pw, ph);
  }, [activeTool, zoomLevel, pw, ph, addElement, selectElement]);

  const handleElDown = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    selectElement(id);
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const el = els.find(el => el.id === id);
    if (!el) return;
    dragging.current = {
      id,
      ox: (e.clientX - rect.left) / zoomLevel - el.x,
      oy: (e.clientY - rect.top) / zoomLevel - el.y,
    };

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !panelRef.current) return;
      const r = panelRef.current.getBoundingClientRect();
      const found = useConfiguratorStore.getState().currentElements().find(e => e.id === dragging.current!.id);
      if (!found) return;
      const nx = snap((ev.clientX - r.left) / zoomLevel - dragging.current.ox);
      const ny = snap((ev.clientY - r.top) / zoomLevel - dragging.current.oy);
      moveElement(dragging.current.id, Math.max(0, Math.min(pw - found.w, nx)), Math.max(0, Math.min(ph - found.h, ny)));
    };
    const onUp = () => { dragging.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [els, zoomLevel, pw, ph, selectElement, moveElement]);

  const elStyle = (type: string) => {
    switch (type) {
      case 'hole': return 'bg-amber-400/80 rounded-full border-2 border-amber-600 shadow-inner';
      case 'rect': return 'bg-sky-400/60 border-2 border-sky-600 shadow-sm';
      case 'opening': return 'bg-emerald-400/60 border-2 border-emerald-600 rounded-sm shadow-sm';
      default: return '';
    }
  };

  const elIcon = (type: string) => {
    switch (type) {
      case 'hole': return '⊚';
      case 'rect': return '▬';
      case 'opening': return '▭';
      default: return '';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-muted/50 flex items-center justify-center p-8">
      <div
        ref={panelRef}
        className="relative bg-card shadow-lg border-2 rounded-sm grid-dots"
        style={{
          width: pw * zoomLevel,
          height: ph * zoomLevel,
          backgroundSize: `${SNAP_GRID * zoomLevel}px ${SNAP_GRID * zoomLevel}px`,
          cursor: activeTool === 'move' ? 'default' : 'crosshair',
        }}
        onClick={handlePanelClick}
      >
        {/* Major grid lines every 50mm */}
        {Array.from({ length: Math.floor(pw / 50) }).map((_, i) => (
          <div key={`v${i}`} className="absolute top-0 bottom-0 w-px bg-border/60 pointer-events-none" style={{ left: (i + 1) * 50 * zoomLevel }} />
        ))}
        {Array.from({ length: Math.floor(ph / 50) }).map((_, i) => (
          <div key={`h${i}`} className="absolute left-0 right-0 h-px bg-border/60 pointer-events-none" style={{ top: (i + 1) * 50 * zoomLevel }} />
        ))}

        {/* Dimension labels */}
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-mono">{pw}mm</span>
        <span className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-muted-foreground font-mono">{ph}mm</span>

        {/* Elements */}
        {els.map(el => (
          <div
            key={el.id}
            className={cn(
              'panel-el absolute cursor-move flex items-center justify-center text-[9px] text-white font-bold select-none',
              elStyle(el.type),
              selectedElId === el.id && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
            )}
            style={{
              left: el.x * zoomLevel,
              top: el.y * zoomLevel,
              width: el.w * zoomLevel,
              height: el.h * zoomLevel,
            }}
            onMouseDown={(e) => handleElDown(e, el.id)}
          >
            {elIcon(el.type)}
            {selectedElId === el.id && (
              <div className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-primary rounded-sm cursor-se-resize border border-primary-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
