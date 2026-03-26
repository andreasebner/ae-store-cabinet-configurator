'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { getPanelDimensions, snap, SNAP_GRID } from '@/lib/constants';
import { ElementType, PanelElement } from '@/lib/types';

export default function PanelEditor() {
  const currentCabinet = useConfiguratorStore(s => s.currentCabinet);
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const activeTool = useConfiguratorStore(s => s.activeTool);
  const selectedElId = useConfiguratorStore(s => s.selectedElId);
  const sideElements = useConfiguratorStore(s => s.sideElements);
  const selectElement = useConfiguratorStore(s => s.selectElement);
  const addElement = useConfiguratorStore(s => s.addElement);
  const moveElement = useConfiguratorStore(s => s.moveElement);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState('X: —   Y: —');
  const dragRef = useRef<{ el: PanelElement; offX: number; offY: number } | null>(null);

  const elements = sideElements[currentSide];
  const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.panel-el')) return;
    if (activeTool === 'select' || activeTool === 'measure') {
      selectElement(null);
      return;
    }
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = snap(e.clientX - rect.left);
    const y = snap(e.clientY - rect.top);
    addElement(activeTool as ElementType, x, y, canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight);
  }, [activeTool, selectElement, addElement]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / canvasRef.current.offsetWidth * pw).toFixed(0);
    const my = ((e.clientY - rect.top) / canvasRef.current.offsetHeight * ph).toFixed(0);
    setCoords(`X: ${mx} mm   Y: ${my} mm`);
  }, [pw, ph]);

  const handleElementMouseDown = useCallback((el: PanelElement, e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(el.id);
    const rect = canvasRef.current!.getBoundingClientRect();
    dragRef.current = {
      el,
      offX: e.clientX - rect.left - el.x,
      offY: e.clientY - rect.top - el.y,
    };
  }, [selectElement]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      const { el, offX, offY } = dragRef.current;
      let nx = snap(e.clientX - r.left - offX);
      let ny = snap(e.clientY - r.top - offY);
      nx = Math.max(0, Math.min(canvasRef.current.offsetWidth - el.w, nx));
      ny = Math.max(0, Math.min(canvasRef.current.offsetHeight - el.h, ny));
      moveElement(el.id, nx, ny);
      const mx = (nx / canvasRef.current.offsetWidth * pw).toFixed(0);
      const my = (ny / canvasRef.current.offsetHeight * ph).toFixed(0);
      setCoords(`X: ${mx} mm   Y: ${my} mm`);
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [pw, ph, moveElement]);

  const cursor = activeTool === 'select' ? 'default' : 'crosshair';

  return (
    <div className="flex-1 relative flex items-center justify-center bg-[#12141A] overflow-hidden">
      {/* Blueprint dotted grid background */}
      <div className="absolute inset-0 blueprint-grid" />

      {/* Canvas panel — dark steel */}
      <div
        ref={canvasRef}
        className="relative w-[340px] h-[400px] bg-gradient-to-br from-[#2A2F38] to-[#1E2128] border-2 border-[#4B5563] rounded-sm z-[1]"
        style={{ cursor, boxShadow: '0 0 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)' }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setCoords('X: —   Y: —')}
      >
        {/* Dimension labels */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#6B7280] bg-[#1A1D23] px-2 py-0.5 rounded-sm border border-[#3A3F4A] tabular-nums font-mono">
          {pw} mm
        </div>
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-[#6B7280] bg-[#1A1D23] px-2 py-0.5 rounded-sm border border-[#3A3F4A] tabular-nums font-mono">
          {ph} mm
        </div>

        {/* Elements */}
        {elements.map(el => {
          const typeClass = el.type === 'hole' ? 'el-hole' : el.type === 'rect' ? 'el-rect' : 'el-opening';
          const isSelected = el.id === selectedElId;
          const label = el.type === 'hole' ? `\u00D8${el.diameter}` : el.type === 'rect' ? `${el.w}\u00D7${el.h}` : 'Opening';

          return (
            <div
              key={el.id}
              className={`panel-el ${typeClass} ${isSelected ? 'selected' : ''}`}
              style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
              onMouseDown={e => handleElementMouseDown(el, e)}
            >
              <span className="el-label">{label}</span>
              {isSelected && el.type !== 'hole' && (
                <>
                  <div className="handle handle-nw" />
                  <div className="handle handle-ne" />
                  <div className="handle handle-sw" />
                  <div className="handle handle-se" />
                </>
              )}
            </div>
          );
        })}

        {/* Alignment guides for selected */}
        {selectedElId && (() => {
          const sel = elements.find(e => e.id === selectedElId);
          if (!sel) return null;
          return (
            <>
              <div className="guide-line guide-line-v" style={{ left: sel.x + sel.w / 2 }} />
              <div className="guide-line guide-line-h" style={{ top: sel.y + sel.h / 2 }} />
            </>
          );
        })()}

        {/* Coordinate display — industrial tooltip style */}
        <div className="absolute bottom-1.5 left-1.5 text-[10px] text-[#9DA3AE] bg-[#1A1D23]/95 px-2 py-1 rounded-sm font-mono tabular-nums z-[5] border border-[#3A3F4A]">
          {coords}
        </div>

        {/* Snap badge — orange accent */}
        <div className="absolute top-1.5 right-1.5 text-[10px] text-[#FF6B2C] bg-[#FF6B2C]/8 border border-[#FF6B2C]/20 px-2 py-0.5 rounded-sm z-[5] flex items-center gap-1 font-mono font-bold">
          <span className="w-[5px] h-[5px] bg-[#FF6B2C] rounded-sm" />
          SNAP: {SNAP_GRID}mm
        </div>
      </div>
    </div>
  );
}
