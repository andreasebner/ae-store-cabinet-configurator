'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { getPanelDimensions, snap, SNAP_GRID, getAlignSnapPoints, SNAP_THRESHOLD } from '@/lib/constants';
import type { ElementType, AlignmentElement, Constraint, BorderRef } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Measurement {
  x1: number; y1: number; x2: number; y2: number;
}

const BORDER_DETECT_PX = 12; // pixels threshold for border click detection

export default function PanelEditor() {
  const {
    currentCabinet, currentSide, activeTool, zoomLevel, selectedElId, selectedElIds,
    addElement, moveElement, moveSelectedElements, resizeElement, selectElement, toggleSelectElement, currentElements,
  } = useConfiguratorStore();
  const setZoom = useConfiguratorStore(s => s.setZoom);
  const setSelectedElIds = useConfiguratorStore(s => s.setSelectedElIds);
  const currentAlignments = useConfiguratorStore(s => s.currentAlignments);
  const selectedAlignId = useConfiguratorStore(s => s.selectedAlignId);
  const selectAlignment = useConfiguratorStore(s => s.selectAlignment);
  const moveAlignment = useConfiguratorStore(s => s.moveAlignment);
  const snapElement = useConfiguratorStore(s => s.snapElement);
  const unsnapElement = useConfiguratorStore(s => s.unsnapElement);
  const snaps = useConfiguratorStore(s => s.snaps);
  const currentConstraints = useConfiguratorStore(s => s.currentConstraints);
  const selectedConstraintId = useConfiguratorStore(s => s.selectedConstraintId);
  const selectConstraint = useConfiguratorStore(s => s.selectConstraint);
  const constraintPlacement = useConfiguratorStore(s => s.constraintPlacement);
  const pickConstraintRef = useConfiguratorStore(s => s.pickConstraintRef);
  const cancelConstraintPlacement = useConfiguratorStore(s => s.cancelConstraintPlacement);
  const updateConstraintValue = useConfiguratorStore(s => s.updateConstraintValue);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: number; ox: number; oy: number; multi: boolean } | null>(null);
  const resizing = useRef<{ id: number; startX: number; startY: number; origW: number; origH: number } | null>(null);
  const justInteracted = useRef(false);
  const lastDrag = useRef<{ x: number; y: number } | null>(null);
  const dragSnapRef = useRef<{ alignId: number; snapIdx: number } | null>(null);
  const dragPrevSnap = useRef<{ alignId: number; snapIdx: number } | null>(null);

  // Alignment drag state
  const alignDragging = useRef<{ id: number; ox: number; oy: number } | null>(null);

  // Marquee selection state
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const marqueeStart = useRef<{ sx: number; sy: number; cx: number; cy: number } | null>(null);

  // Ruler measurement state
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [activeMeasurement, setActiveMeasurement] = useState<Measurement | null>(null);
  const measuringStart = useRef<{ x: number; y: number } | null>(null);

  // Inline constraint value editing
  const [editingConstraint, setEditingConstraint] = useState<{ id: number; x: number; y: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Clear measurement when switching away from ruler
  useEffect(() => {
    if (activeTool !== 'ruler') {
      setMeasurement(null);
      setActiveMeasurement(null);
      measuringStart.current = null;
    }
  }, [activeTool]);

  const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);
  const els = currentElements();
  const aligns = currentAlignments();
  const constraints = currentConstraints();

  // Check if a snap point is occupied
  const isSnapOccupied = useCallback((alignId: number, snapIdx: number, excludeElId?: number) => {
    return Object.entries(snaps).some(
      ([eid, s]) => s.alignId === alignId && s.snapIdx === snapIdx && Number(eid) !== excludeElId
    );
  }, [snaps]);

  const handlePanelClick = useCallback((e: React.MouseEvent) => {
    if (justInteracted.current) { justInteracted.current = false; return; }

    // Constraint placement: border detection (click near panel edges)
    if (constraintPlacement && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const panelW = pw * zoomLevel;
      const panelH = ph * zoomLevel;
      let borderRef: BorderRef | null = null;
      if (px < BORDER_DETECT_PX) borderRef = 'border-left';
      else if (px > panelW - BORDER_DETECT_PX) borderRef = 'border-right';
      else if (py > panelH - BORDER_DETECT_PX) borderRef = 'border-bottom';
      if (borderRef) {
        pickConstraintRef(borderRef, pw, ph);
        return;
      }
      // Clicking on empty area during placement — do nothing (user must click element or border)
      return;
    }

    if (activeTool === 'move' || activeTool === 'ruler') { selectElement(null); return; }
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    addElement(activeTool as ElementType, x, y, pw, ph);
  }, [activeTool, zoomLevel, pw, ph, addElement, selectElement, constraintPlacement, pickConstraintRef]);

  // Mousedown on the panel background — start marquee or ruler
  const handlePanelDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== panelRef.current) return;
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / zoomLevel;
    const py = (e.clientY - rect.top) / zoomLevel;

    if (activeTool === 'ruler') {
      measuringStart.current = { x: px, y: py };
      setActiveMeasurement({ x1: px, y1: py, x2: px, y2: py });
      justInteracted.current = true;

      const onMove = (ev: MouseEvent) => {
        if (!measuringStart.current || !panelRef.current) return;
        const r = panelRef.current.getBoundingClientRect();
        const mx = (ev.clientX - r.left) / zoomLevel;
        const my = (ev.clientY - r.top) / zoomLevel;
        setActiveMeasurement({ x1: measuringStart.current.x, y1: measuringStart.current.y, x2: mx, y2: my });
      };
      const onUp = (ev: MouseEvent) => {
        if (measuringStart.current && panelRef.current) {
          const r = panelRef.current.getBoundingClientRect();
          const mx = (ev.clientX - r.left) / zoomLevel;
          const my = (ev.clientY - r.top) / zoomLevel;
          const dx = mx - measuringStart.current.x;
          const dy = my - measuringStart.current.y;
          if (Math.sqrt(dx * dx + dy * dy) > 3) {
            setMeasurement({ x1: measuringStart.current.x, y1: measuringStart.current.y, x2: mx, y2: my });
          }
          setActiveMeasurement(null);
        }
        measuringStart.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        requestAnimationFrame(() => { justInteracted.current = false; });
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return;
    }

    if (activeTool === 'move') {
      marqueeStart.current = { sx: px, sy: py, cx: e.clientX, cy: e.clientY };
      setMarquee({ x: px, y: py, w: 0, h: 0 });
      justInteracted.current = true;

      const onMove = (ev: MouseEvent) => {
        if (!marqueeStart.current || !panelRef.current) return;
        const r = panelRef.current.getBoundingClientRect();
        const curX = (ev.clientX - r.left) / zoomLevel;
        const curY = (ev.clientY - r.top) / zoomLevel;
        const sx = marqueeStart.current.sx;
        const sy = marqueeStart.current.sy;
        setMarquee({
          x: Math.min(sx, curX),
          y: Math.min(sy, curY),
          w: Math.abs(curX - sx),
          h: Math.abs(curY - sy),
        });
      };
      const onUp = () => {
        setMarquee(prev => {
          if (prev && prev.w > 2 && prev.h > 2) {
            const allEls = useConfiguratorStore.getState().currentElements();
            const ids = new Set<number>();
            for (const el of allEls) {
              const elRight = el.x + el.w;
              const elBottom = el.y + el.h;
              const mRight = prev.x + prev.w;
              const mBottom = prev.y + prev.h;
              if (el.x < mRight && elRight > prev.x && el.y < mBottom && elBottom > prev.y) {
                ids.add(el.id);
              }
            }
            if (ids.size > 0) {
              setSelectedElIds(ids);
            } else {
              selectElement(null);
            }
          }
          return null;
        });
        marqueeStart.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        requestAnimationFrame(() => { justInteracted.current = false; });
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
  }, [activeTool, zoomLevel, selectElement, setSelectedElIds]);

  // ─── Element drag with alignment snap ───
  const handleElDown = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    justInteracted.current = true;

    // Constraint placement: pick element
    if (constraintPlacement) {
      pickConstraintRef(id, pw, ph);
      return;
    }

    const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
    if (isMulti) {
      toggleSelectElement(id);
    } else if (!selectedElIds.has(id)) {
      selectElement(id);
    }
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const el = els.find(el => el.id === id);
    if (!el) return;

    const multiMove = isMulti ? true : selectedElIds.has(id) && selectedElIds.size > 1;
    dragging.current = {
      id,
      ox: (e.clientX - rect.left) / zoomLevel - el.x,
      oy: (e.clientY - rect.top) / zoomLevel - el.y,
      multi: multiMove,
    };
    lastDrag.current = { x: el.x, y: el.y };

    // Track previous snap for this element
    const currentSnaps = useConfiguratorStore.getState().snaps;
    dragPrevSnap.current = currentSnaps[id] || null;
    dragSnapRef.current = null;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !panelRef.current) return;
      justInteracted.current = true;
      const r = panelRef.current.getBoundingClientRect();

      if (dragging.current.multi) {
        const found = useConfiguratorStore.getState().currentElements().find(e => e.id === dragging.current!.id);
        if (!found || !lastDrag.current) return;
        const nx = snap((ev.clientX - r.left) / zoomLevel - dragging.current.ox);
        const ny = snap((ev.clientY - r.top) / zoomLevel - dragging.current.oy);
        const dx = nx - lastDrag.current.x;
        const dy = ny - lastDrag.current.y;
        if (dx !== 0 || dy !== 0) {
          moveSelectedElements(dx, dy, pw, ph);
          lastDrag.current = { x: nx, y: ny };
        }
      } else {
        const found = useConfiguratorStore.getState().currentElements().find(e => e.id === dragging.current!.id);
        if (!found) return;
        let nx = snap((ev.clientX - r.left) / zoomLevel - dragging.current.ox);
        let ny = snap((ev.clientY - r.top) / zoomLevel - dragging.current.oy);

        // Check alignment snap points
        const storeState = useConfiguratorStore.getState();
        const curAligns = storeState.sideAlignments[storeState.currentSide] || [];
        const curSnaps = storeState.snaps;
        const elCx = nx + found.w / 2;
        const elCy = ny + found.h / 2;
        let didSnap = false;

        for (const align of curAligns) {
          const pts = getAlignSnapPoints(align);
          for (let i = 0; i < pts.length; i++) {
            const dist = Math.sqrt((elCx - pts[i].x) ** 2 + (elCy - pts[i].y) ** 2);
            if (dist < SNAP_THRESHOLD) {
              const occupied = Object.entries(curSnaps).some(
                ([eid, s]) => s.alignId === align.id && s.snapIdx === i && Number(eid) !== dragging.current!.id
              );
              if (!occupied) {
                nx = Math.round(pts[i].x - found.w / 2);
                ny = Math.round(pts[i].y - found.h / 2);
                dragSnapRef.current = { alignId: align.id, snapIdx: i };
                didSnap = true;
                break;
              }
            }
          }
          if (didSnap) break;
        }
        if (!didSnap) dragSnapRef.current = null;

        moveElement(dragging.current.id, Math.max(0, Math.min(pw - found.w, nx)), Math.max(0, Math.min(ph - found.h, ny)), didSnap);
      }
    };
    const onUp = () => {
      if (dragging.current) {
        if (dragSnapRef.current) {
          snapElement(dragging.current.id, dragSnapRef.current.alignId, dragSnapRef.current.snapIdx);
        } else if (dragPrevSnap.current) {
          unsnapElement(dragging.current.id);
        }
      }
      dragSnapRef.current = null;
      dragPrevSnap.current = null;
      dragging.current = null;
      lastDrag.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      requestAnimationFrame(() => { justInteracted.current = false; });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [els, zoomLevel, pw, ph, selectElement, toggleSelectElement, selectedElIds, moveElement, moveSelectedElements, snapElement, unsnapElement, constraintPlacement, pickConstraintRef]);

  // ─── Alignment drag ───
  const handleAlignDown = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    justInteracted.current = true;
    selectAlignment(id);
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const storeState = useConfiguratorStore.getState();
    const align = storeState.sideAlignments[storeState.currentSide].find(a => a.id === id);
    if (!align) return;

    alignDragging.current = {
      id,
      ox: (e.clientX - rect.left) / zoomLevel - align.x,
      oy: (e.clientY - rect.top) / zoomLevel - align.y,
    };

    const onMove = (ev: MouseEvent) => {
      if (!alignDragging.current || !panelRef.current) return;
      justInteracted.current = true;
      const r = panelRef.current.getBoundingClientRect();
      const nx = snap((ev.clientX - r.left) / zoomLevel - alignDragging.current.ox);
      const ny = snap((ev.clientY - r.top) / zoomLevel - alignDragging.current.oy);
      moveAlignment(alignDragging.current.id, nx, ny);
    };
    const onUp = () => {
      alignDragging.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      requestAnimationFrame(() => { justInteracted.current = false; });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [zoomLevel, selectAlignment, moveAlignment]);

  const handleResizeDown = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    justInteracted.current = true;
    const el = els.find(el => el.id === id);
    if (!el) return;
    resizing.current = { id, startX: e.clientX, startY: e.clientY, origW: el.w, origH: el.h };

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      justInteracted.current = true;
      const dx = (ev.clientX - resizing.current.startX) / zoomLevel;
      const dy = (ev.clientY - resizing.current.startY) / zoomLevel;
      resizeElement(resizing.current.id, snap(resizing.current.origW + dx), snap(resizing.current.origH + dy));
    };
    const onUp = () => {
      resizing.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      requestAnimationFrame(() => { justInteracted.current = false; });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [els, zoomLevel, resizeElement]);

  const elStyle = (type: string) => {
    switch (type) {
      case 'hole': return 'bg-amber-400/80 rounded-full border-2 border-amber-600 shadow-inner';
      case 'rect': return 'bg-sky-400/60 border-2 border-sky-600 shadow-sm ';
      case 'opening': return 'bg-emerald-400/60 border-2 border-emerald-600 rounded-sm shadow-sm';
      case 'custom': return 'border-2 border-violet-500 shadow-sm';
      default: return '';
    }
  };

  const isSelected = (id: number) => selectedElIds.has(id);

  // Measurement helper
  const renderMeasurementLine = (m: Measurement, isActive: boolean) => {
    const dx = m.x2 - m.x1;
    const dy = m.y2 - m.y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const midX = ((m.x1 + m.x2) / 2) * zoomLevel;
    const midY = ((m.y1 + m.y2) / 2) * zoomLevel;

    return (
      <g key={isActive ? 'active' : 'saved'} className="pointer-events-none">
        <line
          x1={m.x1 * zoomLevel} y1={m.y1 * zoomLevel}
          x2={m.x2 * zoomLevel} y2={m.y2 * zoomLevel}
          stroke={isActive ? '#ef4444' : '#3b82f6'} strokeWidth={1.5} strokeDasharray="4 2"
        />
        <circle cx={m.x1 * zoomLevel} cy={m.y1 * zoomLevel} r={3} fill={isActive ? '#ef4444' : '#3b82f6'} />
        <circle cx={m.x2 * zoomLevel} cy={m.y2 * zoomLevel} r={3} fill={isActive ? '#ef4444' : '#3b82f6'} />
        {dist > 5 && (
          <g transform={`translate(${midX}, ${midY})`}>
            <rect x={-24} y={-10} width={48} height={20} rx={3} fill="white" stroke={isActive ? '#ef4444' : '#3b82f6'} strokeWidth={0.5} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={10} fontFamily="monospace" fill="#334155">
              {Math.round(dist)}mm
            </text>
          </g>
        )}
      </g>
    );
  };

  // Render alignment SVG
  const renderAlignment = (a: AlignmentElement) => {
    const pts = getAlignSnapPoints(a);
    const z = zoomLevel;
    const isSelAlign = selectedAlignId === a.id;
    const color = a.type === 'align-circular' ? '#8b5cf6' : '#0891b2';
    const selColor = isSelAlign ? color : color;

    if (a.type === 'align-circular') {
      const r = a.diameter / 2;
      return (
        <g key={`al-${a.id}`}>
          <circle cx={a.x * z} cy={a.y * z} r={r * z}
            fill="none" stroke={selColor} strokeWidth={isSelAlign ? 2 : 1.5} strokeDasharray="6 3" opacity={isSelAlign ? 0.9 : 0.6} />
          <circle cx={a.x * z} cy={a.y * z} r={3} fill={selColor} opacity={0.8} />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x * z} cy={p.y * z} r={5}
              fill={isSnapOccupied(a.id, i) ? selColor : 'white'} stroke={selColor}
              strokeWidth={1.5} opacity={0.8} />
          ))}
        </g>
      );
    }

    // Rectangular
    const gw = (a.cols - 1) * a.spacingX;
    const gh = (a.rows - 1) * a.spacingY;
    return (
      <g key={`al-${a.id}`}>
        {gw > 0 && gh > 0 && (
          <rect x={(a.x - gw / 2) * z} y={(a.y - gh / 2) * z} width={gw * z} height={gh * z}
            fill="none" stroke={selColor} strokeWidth={isSelAlign ? 2 : 1} strokeDasharray="6 3" opacity={isSelAlign ? 0.8 : 0.5} />
        )}
        {/* Row lines */}
        {gw > 0 && Array.from({ length: a.rows }).map((_, r) => (
          <line key={`r${r}`}
            x1={(a.x - gw / 2) * z} y1={(a.y - gh / 2 + r * a.spacingY) * z}
            x2={(a.x + gw / 2) * z} y2={(a.y - gh / 2 + r * a.spacingY) * z}
            stroke={selColor} strokeWidth={0.5} strokeDasharray="3 2" opacity={0.4} />
        ))}
        {/* Col lines */}
        {gh > 0 && Array.from({ length: a.cols }).map((_, c) => (
          <line key={`c${c}`}
            x1={(a.x - gw / 2 + c * a.spacingX) * z} y1={(a.y - gh / 2) * z}
            x2={(a.x - gw / 2 + c * a.spacingX) * z} y2={(a.y + gh / 2) * z}
            stroke={selColor} strokeWidth={0.5} strokeDasharray="3 2" opacity={0.4} />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x * z} cy={p.y * z} r={5}
            fill={isSnapOccupied(a.id, i) ? selColor : 'white'} stroke={selColor}
            strokeWidth={1.5} opacity={0.8} />
        ))}
      </g>
    );
  };

  // Render constraint lines
  const getRefPoint = (ref: number | BorderRef, axis: 'x' | 'y', edge: 'start' | 'end') => {
    if (typeof ref === 'string') {
      if (ref === 'border-left') return { x: 0, y: ph / 2 };
      if (ref === 'border-right') return { x: pw, y: ph / 2 };
      if (ref === 'border-bottom') return { x: pw / 2, y: ph };
    } else {
      const el = els.find(e => e.id === ref);
      if (el) {
        const cx = el.x + el.w / 2;
        const cy = el.y + el.h / 2;
        if (axis === 'x') return edge === 'start' ? { x: el.x + el.w, y: cy } : { x: el.x, y: cy };
        return edge === 'start' ? { x: cx, y: el.y + el.h } : { x: cx, y: el.y };
      }
    }
    return null;
  };

  const renderConstraint = (c: Constraint) => {
    const z = zoomLevel;
    const isSel = selectedConstraintId === c.id;
    const toEl = els.find(e => e.id === c.toRef);
    if (!toEl) return null;

    // ─── Diameter constraint ───
    if (c.constraintType === 'diameter') {
      const cx = (toEl.x + toEl.w / 2) * z;
      const cy = (toEl.y + toEl.h / 2) * z;
      const r = ((toEl.diameter ?? Math.round(toEl.w * 22 / 36)) / 2) * z * 36 / 22;
      const color = isSel ? '#f97316' : '#94a3b8';
      // Draw a diameter line from left to right through center
      const x1 = cx - r;
      const x2 = cx + r;
      return (
        <g key={`con-${c.id}`} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); selectConstraint(c.id); }}>
          {/* Transparent hit area */}
          <line x1={x1} y1={cy} x2={x2} y2={cy} stroke="transparent" strokeWidth={12} />
          <line x1={x1} y1={cy} x2={x2} y2={cy}
            stroke={color} strokeWidth={isSel ? 2 : 1.5} strokeDasharray="4 3" />
          <circle cx={x1} cy={cy} r={2.5} fill={color} />
          <circle cx={x2} cy={cy} r={2.5} fill={color} />
          {/* Value label */}
          <g transform={`translate(${cx}, ${cy - r - 10})`}
            onClick={(e) => {
              e.stopPropagation();
              selectConstraint(c.id);
              setEditingConstraint({ id: c.id, x: cx, y: cy - r - 10 });
              setEditValue(String(Math.round(c.value)));
            }}
            className="cursor-text"
          >
            <rect x={-20} y={-9} width={40} height={18} rx={3}
              fill="white" stroke={color} strokeWidth={0.75} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={10}
              fontFamily="monospace" fill={isSel ? '#ea580c' : '#475569'}>
              ⌀{Math.round(c.value)}
            </text>
          </g>
        </g>
      );
    }

    // ─── Distance constraint ───
    let x1: number, y1: number, x2: number, y2: number;
    const toCx = toEl.x + toEl.w / 2;
    const toCy = toEl.y + toEl.h / 2;

    if (typeof c.fromRef === 'string') {
      const border = c.fromRef as BorderRef;
      if (c.axis === 'x') {
        if (border === 'border-left') { x1 = 0; y1 = toCy; x2 = toEl.x; y2 = toCy; }
        else if (border === 'border-right') { x1 = toEl.x + toEl.w; y1 = toCy; x2 = pw; y2 = toCy; }
        else return null;
      } else {
        if (border === 'border-bottom') { x1 = toCx; y1 = toEl.y + toEl.h; x2 = toCx; y2 = ph; }
        else return null;
      }
    } else {
      const fromEl = els.find(e => e.id === c.fromRef);
      if (!fromEl) return null;
      const fromCx = fromEl.x + fromEl.w / 2;
      const fromCy = fromEl.y + fromEl.h / 2;
      if (c.axis === 'x') {
        x1 = fromEl.x + fromEl.w; y1 = (fromCy + toCy) / 2;
        x2 = toEl.x; y2 = y1;
      } else {
        x1 = (fromCx + toCx) / 2; y1 = fromEl.y + fromEl.h;
        x2 = x1; y2 = toEl.y;
      }
    }

    const midX = ((x1 + x2) / 2) * z;
    const midY = ((y1 + y2) / 2) * z;
    const color = isSel ? '#f97316' : '#94a3b8';

    return (
      <g key={`con-${c.id}`} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); selectConstraint(c.id); }}>
        {/* Transparent hit area */}
        <line x1={x1 * z} y1={y1 * z} x2={x2 * z} y2={y2 * z} stroke="transparent" strokeWidth={12} />
        <line x1={x1 * z} y1={y1 * z} x2={x2 * z} y2={y2 * z}
          stroke={color} strokeWidth={isSel ? 2 : 1.5} strokeDasharray="4 3" />
        {/* End caps */}
        <line x1={x1 * z} y1={(y1 - 4) * z} x2={x1 * z} y2={(y1 + 4) * z}
          stroke={color} strokeWidth={isSel ? 2 : 1.5}
          style={{ display: c.axis === 'x' ? 'block' : 'none' }} />
        <line x1={(x1 - 4) * z} y1={y1 * z} x2={(x1 + 4) * z} y2={y1 * z}
          stroke={color} strokeWidth={isSel ? 2 : 1.5}
          style={{ display: c.axis === 'y' ? 'block' : 'none' }} />
        <line x1={x2 * z} y1={(y2 - 4) * z} x2={x2 * z} y2={(y2 + 4) * z}
          stroke={color} strokeWidth={isSel ? 2 : 1.5}
          style={{ display: c.axis === 'x' ? 'block' : 'none' }} />
        <line x1={(x2 - 4) * z} y1={y2 * z} x2={(x2 + 4) * z} y2={y2 * z}
          stroke={color} strokeWidth={isSel ? 2 : 1.5}
          style={{ display: c.axis === 'y' ? 'block' : 'none' }} />
        {/* Value label — clickable for inline editing */}
        <g transform={`translate(${midX}, ${midY})`}
          onClick={(e) => {
            e.stopPropagation();
            selectConstraint(c.id);
            setEditingConstraint({ id: c.id, x: midX, y: midY });
            setEditValue(String(Math.round(c.value)));
          }}
          className="cursor-text"
        >
          <rect x={-20} y={-9} width={40} height={18} rx={3}
            fill="white" stroke={color} strokeWidth={0.75} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={10}
            fontFamily="monospace" fill={isSel ? '#ea580c' : '#475569'}>
            {Math.round(c.value)}
          </text>
        </g>
      </g>
    );
  };

  const cursorStyle = constraintPlacement ? 'crosshair' : activeTool === 'move' ? 'default' : activeTool === 'ruler' ? 'crosshair' : 'crosshair';

  // Mousewheel zoom handler (Ctrl+Wheel or pinch-to-zoom)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setZoom(Math.round((zoomLevel + delta) * 100) / 100);
  }, [zoomLevel, setZoom]);

  // Scale bar: pick a nice round mm value that fits ~60-100px at current zoom
  const scaleBarMM = (() => {
    const candidates = [10, 20, 25, 50, 100, 200];
    for (const mm of candidates) {
      const px = mm * zoomLevel;
      if (px >= 40 && px <= 120) return mm;
    }
    return 50;
  })();
  const scaleBarPx = scaleBarMM * zoomLevel;

  return (
    <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-6 relative" onWheel={handleWheel}>
      {/* Scale indicator — upper right */}
      <div className="absolute top-2 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded px-2 py-1 pointer-events-none z-10">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[9px] text-slate-400 font-medium">{Math.round(zoomLevel * 100)}%</span>
          <div className="flex items-center gap-1">
            <div className="relative" style={{ width: scaleBarPx, height: 6 }}>
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-500" />
              <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-500" />
              <div className="absolute right-0 top-0 bottom-0 w-px bg-slate-500" />
            </div>
            <span className="text-[9px] text-slate-500 font-mono">{scaleBarMM}mm</span>
          </div>
        </div>
      </div>

      <div
        ref={panelRef}
        className="relative bg-white shadow-lg border-2 border-slate-200 rounded-sm grid-dots shrink-0"
        style={{
          width: pw * zoomLevel,
          height: ph * zoomLevel,
          backgroundSize: `${SNAP_GRID * zoomLevel}px ${SNAP_GRID * zoomLevel}px`,
          cursor: cursorStyle,
        }}
        onClick={handlePanelClick}
        onMouseDown={handlePanelDown}
      >
        {/* Grid lines */}
        {Array.from({ length: Math.floor(pw / 50) }).map((_, i) => (
          <div key={`v${i}`} className="absolute top-0 bottom-0 w-px bg-slate-200/60 pointer-events-none" style={{ left: (i + 1) * 50 * zoomLevel }} />
        ))}
        {Array.from({ length: Math.floor(ph / 50) }).map((_, i) => (
          <div key={`h${i}`} className="absolute left-0 right-0 h-px bg-slate-200/60 pointer-events-none" style={{ top: (i + 1) * 50 * zoomLevel }} />
        ))}

        {/* Dimension labels */}
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono">{pw}mm</span>
        <span className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-slate-400 font-mono">{ph}mm</span>

        {/* Elements */}
        {els.map(el => (
          <div
            key={el.id}
            className={cn(
              'panel-el absolute cursor-move flex items-center justify-center select-none',
              elStyle(el.type),
              isSelected(el.id) && 'ring-2 ring-brand-500 ring-offset-1 ring-offset-white'
            )}
            style={{
              left: el.x * zoomLevel,
              top: el.y * zoomLevel,
              width: el.w * zoomLevel,
              height: el.h * zoomLevel,
              ...(el.type === 'rect' && el.radius ? { borderRadius: el.radius * zoomLevel } : {}),
            }}
            onMouseDown={(e) => handleElDown(e, el.id)}
          >
            {/* Custom shape SVG */}
            {el.type === 'custom' && el.pathData && el.pathViewBox ? (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`${el.pathViewBox[0]} ${el.pathViewBox[1]} ${el.pathViewBox[2]} ${el.pathViewBox[3]}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <path d={el.pathData} fill="rgba(139, 92, 246, 0.4)" stroke="rgb(139, 92, 246)" strokeWidth={el.pathViewBox[2] * 0.015} />
              </svg>
            ) : el.type === 'rect' && el.anchor && el.anchor !== 'center' ? (
              <div className="absolute inset-0 pointer-events-none">
                <div className={cn(
                  'absolute w-2 h-2 rounded-full bg-white border-2 border-sky-700',
                  el.anchor === 'top-left' && 'top-0.5 left-0.5',
                  el.anchor === 'top-right' && 'top-0.5 right-0.5',
                  el.anchor === 'bottom-left' && 'bottom-0.5 left-0.5',
                  el.anchor === 'bottom-right' && 'bottom-0.5 right-0.5',
                )} />
              </div>
            ) : (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute w-px bg-white/90" style={{ height: Math.min(12, el.h * zoomLevel * 0.6) }} />
                <div className="absolute h-px bg-white/90" style={{ width: Math.min(12, el.w * zoomLevel * 0.6) }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white border border-slate-600/60" />
              </div>
            )}
            {/* Resize handle */}
            {isSelected(el.id) && selectedElIds.size === 1 && (
              <div
                className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-brand-500 rounded-sm cursor-se-resize border border-white"
                onMouseDown={(e) => handleResizeDown(e, el.id)}
              />
            )}
          </div>
        ))}

        {/* Alignment center drag handles */}
        {aligns.map(a => (
          <div
            key={`ah-${a.id}`}
            className={cn(
              'absolute w-5 h-5 rounded-full cursor-move flex items-center justify-center',
              selectedAlignId === a.id
                ? (a.type === 'align-circular' ? 'bg-purple-500 border-2 border-white shadow-lg' : 'bg-cyan-500 border-2 border-white shadow-lg')
                : (a.type === 'align-circular' ? 'bg-purple-400/70 border border-purple-600' : 'bg-cyan-400/70 border border-cyan-600')
            )}
            style={{
              left: a.x * zoomLevel,
              top: a.y * zoomLevel,
              transform: 'translate(-50%, -50%)',
              zIndex: 40,
            }}
            onMouseDown={(e) => handleAlignDown(e, a.id)}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        ))}

        {/* Marquee selection box */}
        {marquee && marquee.w > 1 && marquee.h > 1 && (
          <div
            className="absolute border-2 border-brand-500 bg-brand-500/10 pointer-events-none"
            style={{
              left: marquee.x * zoomLevel,
              top: marquee.y * zoomLevel,
              width: marquee.w * zoomLevel,
              height: marquee.h * zoomLevel,
            }}
          />
        )}

        {/* SVG overlay: measurements + alignment visuals */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 50 }}>
          {measurement && renderMeasurementLine(measurement, false)}
          {activeMeasurement && renderMeasurementLine(activeMeasurement, true)}
          {aligns.map(a => renderAlignment(a))}
          <g style={{ pointerEvents: 'auto' }}>
            {constraints.map(c => renderConstraint(c))}
          </g>
        </svg>

        {/* Constraint placement mode: border highlight zones */}
        {constraintPlacement && constraintPlacement.step !== 'pick-element' && (
          <>
            <div className="absolute top-0 left-0 h-full pointer-events-auto cursor-pointer hover:bg-orange-400/20 transition-colors"
              style={{ width: BORDER_DETECT_PX, zIndex: 55 }}
              onClick={(e) => { e.stopPropagation(); pickConstraintRef('border-left', pw, ph); }}
            />
            <div className="absolute top-0 right-0 h-full pointer-events-auto cursor-pointer hover:bg-orange-400/20 transition-colors"
              style={{ width: BORDER_DETECT_PX, zIndex: 55 }}
              onClick={(e) => { e.stopPropagation(); pickConstraintRef('border-right', pw, ph); }}
            />
            <div className="absolute bottom-0 left-0 w-full pointer-events-auto cursor-pointer hover:bg-orange-400/20 transition-colors"
              style={{ height: BORDER_DETECT_PX, zIndex: 55 }}
              onClick={(e) => { e.stopPropagation(); pickConstraintRef('border-bottom', pw, ph); }}
            />
          </>
        )}

        {/* Constraint placement mode indicator */}
        {constraintPlacement && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] px-3 py-1 rounded-full shadow-lg pointer-events-none whitespace-nowrap" style={{ zIndex: 60 }}>
            {constraintPlacement.step === 'pick-from' && 'Click an element or border as start reference'}
            {constraintPlacement.step === 'pick-to' && 'Click the target element'}
            {constraintPlacement.step === 'pick-element' && 'Click a hole element'}
          </div>
        )}

        {/* Inline constraint value editor */}
        {editingConstraint && (
          <div
            className="absolute"
            style={{
              left: editingConstraint.x - 28,
              top: editingConstraint.y - 11,
              zIndex: 60,
            }}
          >
            <input
              ref={editInputRef}
              type="number"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const v = Number(editValue);
                  if (!isNaN(v) && v >= 0) updateConstraintValue(editingConstraint.id, v, pw, ph);
                  setEditingConstraint(null);
                } else if (e.key === 'Escape') {
                  setEditingConstraint(null);
                }
              }}
              onBlur={() => {
                const v = Number(editValue);
                if (!isNaN(v) && v >= 0) updateConstraintValue(editingConstraint.id, v, pw, ph);
                setEditingConstraint(null);
              }}
              autoFocus
              className="w-14 h-5 text-[10px] text-center font-mono bg-white border border-orange-400 rounded shadow-md outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}

