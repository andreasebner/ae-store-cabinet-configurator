'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { SIDE_ROTATIONS, VIEW_TRANSFORMS } from '@/lib/constants';
import { Side, ViewMode } from '@/lib/types';

const SIDES_DATA: { side: Side; className: string }[] = [
  { side: 'front', className: 'face-front' },
  { side: 'back', className: 'face-back' },
  { side: 'left', className: 'face-left' },
  { side: 'right', className: 'face-right' },
  { side: 'top', className: 'face-top' },
  { side: 'bottom', className: 'face-bottom' },
];

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: 'perspective', label: 'Perspective' },
  { key: 'front', label: 'Front' },
  { key: 'top', label: 'Top' },
  { key: 'side', label: 'Side' },
];

export default function Cabinet3DPreview() {
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const setSide = useConfiguratorStore(s => s.setSide);
  const zoomLevel = useConfiguratorStore(s => s.zoomLevel);
  const setZoom = useConfiguratorStore(s => s.setZoom);

  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [transform, setTransform] = useState(SIDE_ROTATIONS.front);
  const containerRef = useRef<HTMLDivElement>(null);

  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: -15, y: -25 });

  const applyTransform = useCallback((t: string, zoom: number) => {
    setTransform(zoom !== 1 ? `${t} scale(${zoom})` : t);
  }, []);

  const handleSelectSide = useCallback((side: Side) => {
    setSide(side);
    setViewMode('perspective');
    applyTransform(SIDE_ROTATIONS[side], zoomLevel);
    const rots: Record<string, { x: number; y: number }> = {
      front: { x: -15, y: -25 }, back: { x: -15, y: 155 },
      left: { x: -15, y: 65 }, right: { x: -15, y: -65 },
      top: { x: -65, y: -25 }, bottom: { x: 45, y: -25 },
    };
    rotRef.current = rots[side] || rots.front;
  }, [setSide, zoomLevel, applyTransform]);

  const handleViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'perspective') {
      applyTransform(SIDE_ROTATIONS[currentSide], zoomLevel);
    } else {
      applyTransform(VIEW_TRANSFORMS[mode], zoomLevel);
    }
  }, [currentSide, zoomLevel, applyTransform]);

  // Drag to rotate
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.face')) return;
    draggingRef.current = true;
    startRef.current = { x: e.clientX, y: e.clientY };
    setViewMode('perspective');
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      rotRef.current.y += dx * 0.5;
      rotRef.current.x = Math.max(-80, Math.min(80, rotRef.current.x - dy * 0.5));
      startRef.current = { x: e.clientX, y: e.clientY };
      const t = `rotateX(${rotRef.current.x}deg) rotateY(${rotRef.current.y}deg)`;
      applyTransform(t, zoomLevel);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [zoomLevel, applyTransform]);

  return (
    <div className="flex-1 flex flex-col bg-[#F5F2EE] relative rounded-t-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A69E97] font-outfit">3D Preview</span>
        {/* Pill-shaped view mode toggle */}
        <div className="flex gap-1 bg-[#EDE8E1] rounded-2xl p-1">
          {VIEW_MODES.map(vm => (
            <button
              key={vm.key}
              onClick={() => handleViewMode(vm.key)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all
                ${viewMode === vm.key
                  ? 'bg-white text-[#C4644A] shadow-[0_1px_4px_rgba(61,53,50,0.08)]'
                  : 'text-[#8A817A] hover:text-[#5C5550]'}`}
            >
              {vm.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Scene */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: '900px' }}
        onMouseDown={onMouseDown}
      >
        <div
          className="w-[260px] h-[340px] relative"
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)', transform }}
        >
          {SIDES_DATA.map(({ side, className }) => (
            <div
              key={side}
              className={`face ${className} ${currentSide === side ? 'selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); handleSelectSide(side); }}
            >
              {side === 'front' && (
                <>
                  {/* Soft handle */}
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 w-1.5 h-[60px] bg-gradient-to-b from-[#C4BCB5] to-[#A69E97] rounded-full shadow-[1px_0_3px_rgba(61,53,50,0.1)]" />
                  {/* Ventilation slots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-[6px]">
                    {[0,1,2,3].map(i => <div key={i} className="w-8 h-0.5 bg-black/[0.06] rounded-full" />)}
                  </div>
                </>
              )}
              <span>{side.charAt(0).toUpperCase() + side.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom Controls — soft rounded */}
      <div className="absolute bottom-[70px] right-5 flex flex-col bg-white rounded-2xl shadow-[0_2px_12px_rgba(61,53,50,0.08)] overflow-hidden z-10">
        <button onClick={() => setZoom(zoomLevel + 0.15)} className="w-9 h-9 flex items-center justify-center text-[#8A817A] hover:bg-[#F5F2EE] hover:text-[#3D3532] text-[16px] transition-all">+</button>
        <div className="h-px bg-[#EDE8E3] mx-1.5" />
        <button onClick={() => setZoom(zoomLevel - 0.15)} className="w-9 h-9 flex items-center justify-center text-[#8A817A] hover:bg-[#F5F2EE] hover:text-[#3D3532] text-[16px] transition-all">−</button>
        <div className="h-px bg-[#EDE8E3] mx-1.5" />
        <button onClick={() => { setZoom(1); handleSelectSide(currentSide); }} className="w-9 h-9 flex items-center justify-center text-[#8A817A] hover:bg-[#F5F2EE] hover:text-[#3D3532] text-[14px] transition-all">⊡</button>
      </div>
    </div>
  );
}
