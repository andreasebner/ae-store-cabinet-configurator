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
    <div className="flex-1 flex flex-col relative" style={{ background: '#080C16' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.15em] font-chakra"
          style={{ color: 'var(--text-tertiary)' }}
        >
          3D PREVIEW
        </span>
        <div className="flex gap-0.5 p-0.5 rounded" style={{ background: 'rgba(20, 25, 41, 0.8)', border: '1px solid var(--border)' }}>
          {VIEW_MODES.map(vm => (
            <button
              key={vm.key}
              onClick={() => handleViewMode(vm.key)}
              className="px-2.5 py-1 rounded text-[11px] font-medium transition-all font-chakra"
              style={viewMode === vm.key ? {
                background: 'var(--cyan)',
                color: 'var(--navy-base)',
                boxShadow: '0 0 12px rgba(0, 229, 255, 0.3)',
              } : {
                color: 'var(--text-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                if (viewMode !== vm.key) {
                  e.currentTarget.style.color = 'var(--cyan)';
                  e.currentTarget.style.background = 'var(--cyan-subtle)';
                }
              }}
              onMouseLeave={e => {
                if (viewMode !== vm.key) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
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
                  {/* Glowing handle */}
                  <div
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-1 h-[60px] rounded-sm"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.3), rgba(0, 229, 255, 0.6), rgba(0, 229, 255, 0.3))',
                      boxShadow: '0 0 8px rgba(0, 229, 255, 0.3), 1px 0 2px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  {/* Bottom vents */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-[5px]">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="w-8 h-0.5 rounded-sm" style={{ background: 'rgba(0, 229, 255, 0.15)' }} />
                    ))}
                  </div>
                </>
              )}
              <span>{side.charAt(0).toUpperCase() + side.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div
        className="absolute bottom-[70px] right-4 flex flex-col rounded overflow-hidden z-10"
        style={{
          background: 'var(--navy-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        }}
      >
        <button
          onClick={() => setZoom(zoomLevel + 0.15)}
          className="w-8 h-8 flex items-center justify-center text-[15px] font-bold transition-all font-chakra"
          style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--cyan)';
            e.currentTarget.style.background = 'var(--cyan-subtle)';
            e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(0, 229, 255, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >+</button>
        <button
          onClick={() => setZoom(zoomLevel - 0.15)}
          className="w-8 h-8 flex items-center justify-center text-[15px] font-bold transition-all font-chakra"
          style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--cyan)';
            e.currentTarget.style.background = 'var(--cyan-subtle)';
            e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(0, 229, 255, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >&#x2212;</button>
        <button
          onClick={() => { setZoom(1); handleSelectSide(currentSide); }}
          className="w-8 h-8 flex items-center justify-center text-[15px] transition-all"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--cyan)';
            e.currentTarget.style.background = 'var(--cyan-subtle)';
            e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(0, 229, 255, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >&#x22A1;</button>
      </div>
    </div>
  );
}
