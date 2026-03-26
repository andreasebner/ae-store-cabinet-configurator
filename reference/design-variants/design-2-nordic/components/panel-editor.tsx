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
    <div className="flex-1 relative flex items-center justify-center bg-[#FAF8F5] overflow-hidden">
      {/* Warm dotted grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(196,100,74,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Canvas panel — warm gradient, rounded corners */}
      <div
        ref={canvasRef}
        className="relative w-[340px] h-[400px] bg-gradient-to-br from-[#E8E1DA] to-[#D6CEC5] border-[1.5px] border-[#C4BCB5] rounded z-[1]"
        style={{ cursor }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setCoords('X: —   Y: —')}
      >
        {/* Dimension labels */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#A69E97] bg-white px-2 py-0.5 rounded-lg border border-[#EDE8E3] tabular-nums shadow-sm">
          {pw} mm
        </div>
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold text-[#A69E97] bg-white px-2 py-0.5 rounded-lg border border-[#EDE8E3] tabular-nums shadow-sm">
          {ph} mm
        </div>

        {/* Elements */}
        {elements.map(el => {
          const typeClass = el.type === 'hole' ? 'el-hole' : el.type === 'rect' ? 'el-rect' : 'el-opening';
          const isSelected = el.id === selectedElId;
          const label = el.type === 'hole' ? `Ø${el.diameter}` : el.type === 'rect' ? `${el.w}×${el.h}` : 'Opening';

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

        {/* Coordinate display — warm friendly style */}
        <div className="absolute bottom-2 left-2 text-[10px] text-[#8A817A] bg-white/90 px-2 py-1 rounded-lg font-mono tabular-nums z-[5] shadow-sm">
          {coords}
        </div>

        {/* Snap badge — sage green */}
        <div className="absolute top-2 right-2 text-[10px] text-[#7B9E87] bg-[#E3EDE6] border border-[#7B9E87]/15 px-2 py-1 rounded-lg z-[5] flex items-center gap-1.5 font-medium">
          <span className="w-[5px] h-[5px] bg-[#7B9E87] rounded-full" />
          Snap: {SNAP_GRID}mm
        </div>
      </div>
    </div>
  );
}
