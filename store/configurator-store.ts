import { create } from 'zustand';
import type { CabinetKey, Side, ToolType, ElementType, PanelElement, SideElements, AlignmentElement, Constraint, SideConstraints, BorderRef } from '@/lib/types';
import { SIDES, ELEMENT_DEFAULTS, MAX_UNDO, snap, calcPrice, getAlignSnapPoints } from '@/lib/constants';

function emptySideElements(): SideElements {
  return Object.fromEntries(SIDES.map(s => [s, []])) as SideElements;
}

type SideAlignments = Record<Side, AlignmentElement[]>;
type SnapMap = Record<number, { alignId: number; snapIdx: number }>;

interface Snapshot {
  se: SideElements;
  al: SideAlignments;
  sn: SnapMap;
  co: SideConstraints;
}

function emptyAlignments(): SideAlignments {
  return Object.fromEntries(SIDES.map(s => [s, []])) as SideAlignments;
}

function emptyConstraints(): SideConstraints {
  return Object.fromEntries(SIDES.map(s => [s, []])) as SideConstraints;
}

function cloneSnapshot(se: SideElements, al: SideAlignments, sn: SnapMap, co: SideConstraints): Snapshot {
  return { se: JSON.parse(JSON.stringify(se)), al: JSON.parse(JSON.stringify(al)), sn: { ...sn }, co: JSON.parse(JSON.stringify(co)) };
}

interface ConfiguratorStore {
  currentCabinet: CabinetKey;
  currentSide: Side;
  activeTool: ToolType;
  selectedElId: number | null;
  selectedElIds: Set<number>;
  selectedAlignId: number | null;
  nextId: number;
  cartItems: number;
  zoomLevel: number;
  sideElements: SideElements;
  sideAlignments: SideAlignments;
  snaps: SnapMap;
  sideConstraints: SideConstraints;
  selectedConstraintId: number | null;
  undoStack: Snapshot[];
  redoStack: Snapshot[];
  toastMessage: string | null;
  toastIcon: string;
  price: number;

  setCabinet: (key: CabinetKey) => void;
  setSide: (side: Side) => void;
  setTool: (tool: ToolType) => void;
  selectElement: (id: number | null) => void;
  toggleSelectElement: (id: number) => void;
  setSelectedElIds: (ids: Set<number>) => void;
  addElement: (type: ElementType, x: number, y: number, cw: number, ch: number) => void;
  moveElement: (id: number, x: number, y: number, exact?: boolean) => void;
  moveSelectedElements: (dx: number, dy: number, pw: number, ph: number) => void;
  resizeElement: (id: number, w: number, h: number) => void;
  updateElementProp: (id: number, prop: string, value: number | string) => void;
  deleteElement: (id: number) => void;
  deleteSelected: () => void;
  deleteSelectedMulti: () => void;
  clearCurrentSide: () => void;

  addAlignment: (type: 'circular' | 'rectangular', pw: number, ph: number) => void;
  selectAlignment: (id: number | null) => void;
  moveAlignment: (id: number, x: number, y: number) => void;
  updateAlignmentProp: (id: number, prop: string, value: number) => void;
  deleteAlignment: (id: number) => void;
  currentAlignments: () => AlignmentElement[];
  snapElement: (elId: number, alignId: number, snapIdx: number) => void;
  unsnapElement: (elId: number) => void;

  addConstraint: (fromRef: number | BorderRef, toRef: number, axis: 'x' | 'y', value: number) => void;
  selectConstraint: (id: number | null) => void;
  updateConstraintValue: (id: number, value: number, pw: number, ph: number) => void;
  deleteConstraint: (id: number) => void;
  currentConstraints: () => Constraint[];

  loadProject: (cabinetKey: CabinetKey, sideElements: SideElements) => void;
  resetProject: () => void;
  undo: () => void;
  redo: () => void;
  addToCart: () => void;
  setZoom: (level: number) => void;
  showToast: (msg: string, icon?: string) => void;
  clearToast: () => void;
  sideHasEdits: (side: Side) => boolean;
  currentElements: () => PanelElement[];
}

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  currentCabinet: 'compact',
  currentSide: 'front',
  activeTool: 'hole',
  selectedElId: null,
  selectedElIds: new Set<number>(),
  selectedAlignId: null,
  nextId: 1,
  cartItems: 0,
  zoomLevel: 1,
  sideElements: emptySideElements(),
  sideAlignments: emptyAlignments(),
  snaps: {},
  sideConstraints: emptyConstraints(),
  selectedConstraintId: null,
  undoStack: [],
  redoStack: [],
  toastMessage: null,
  toastIcon: '✓',
  price: 320,

  setCabinet: (key) => set(state => ({
    currentCabinet: key,
    price: calcPrice(key, state.sideElements),
  })),
  setSide: (side) => set({ currentSide: side, selectedElId: null, selectedElIds: new Set(), selectedAlignId: null }),
  setTool: (tool) => set({ activeTool: tool }),
  selectElement: (id) => set({ selectedElId: id, selectedElIds: id !== null ? new Set([id]) : new Set(), selectedAlignId: null }),
  toggleSelectElement: (id) => set(state => {
    const next = new Set(state.selectedElIds);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    return { selectedElIds: next, selectedElId: next.size > 0 ? id : null, selectedAlignId: null };
  }),
  setSelectedElIds: (ids) => set({ selectedElIds: ids, selectedElId: ids.size > 0 ? [...ids][0] : null, selectedAlignId: null }),

  addElement: (type, clickX, clickY, canvasW, canvasH) => {
    const state = get();
    const d = ELEMENT_DEFAULTS[type];
    const x = snap(Math.max(0, Math.min(canvasW - d.w, clickX - d.w / 2)));
    const y = snap(Math.max(0, Math.min(canvasH - d.h, clickY - d.h / 2)));
    const newEl: PanelElement = {
      id: state.nextId, type, x, y, w: d.w, h: d.h,
      ...(type === 'hole' ? { diameter: d.diameter } : {}),
      ...(type === 'rect' ? { anchor: 'center' as const, radius: 3 } : {}),
    };
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = [...newElements[state.currentSide], newEl];
    set({
      sideElements: newElements, selectedElId: state.nextId,
      selectedElIds: new Set([state.nextId]), selectedAlignId: null,
      nextId: state.nextId + 1, undoStack, redoStack: [],
      price: calcPrice(state.currentCabinet, newElements),
    });
  },

  moveElement: (id, x, y, exact) => set(state => {
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].map(el =>
      el.id === id ? { ...el, x: exact ? Math.round(x) : snap(x), y: exact ? Math.round(y) : snap(y) } : el
    );
    return { sideElements: newElements };
  }),

  moveSelectedElements: (dx, dy, pw, ph) => set(state => {
    const ids = state.selectedElIds;
    if (ids.size === 0) return state;
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].map(el => {
      if (!ids.has(el.id)) return el;
      return { ...el, x: snap(Math.max(0, Math.min(pw - el.w, el.x + dx))), y: snap(Math.max(0, Math.min(ph - el.h, el.y + dy))) };
    });
    return { sideElements: newElements };
  }),

  resizeElement: (id, w, h) => set(state => {
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].map(el => {
      if (el.id !== id) return el;
      if (el.type === 'hole') {
        const d = Math.max(10, snap(Math.max(w, h)));
        return { ...el, w: d, h: d, diameter: Math.round(d * 22 / 36) };
      }
      return { ...el, w: Math.max(10, snap(w)), h: Math.max(10, snap(h)) };
    });
    return { sideElements: newElements, undoStack, redoStack: [], price: calcPrice(state.currentCabinet, newElements) };
  }),

  updateElementProp: (id, prop, value) => set(state => {
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].map(el => {
      if (el.id !== id) return el;
      const u = { ...el, [prop]: value };
      if (prop === 'diameter' && el.type === 'hole') { const v = Number(value); u.w = Math.round(v * 36 / 22); u.h = u.w; }
      if (prop === 'radius' && el.type === 'rect') { u.radius = Math.max(3, Number(value)); }
      return u;
    });
    return { sideElements: newElements, undoStack, redoStack: [], price: calcPrice(state.currentCabinet, newElements) };
  }),

  deleteElement: (id) => set(state => {
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].filter(el => el.id !== id);
    const newSnaps = { ...state.snaps };
    delete newSnaps[id];
    return {
      sideElements: newElements,
      selectedElId: state.selectedElId === id ? null : state.selectedElId,
      snaps: newSnaps, undoStack, redoStack: [],
      price: calcPrice(state.currentCabinet, newElements),
    };
  }),

  deleteSelected: () => { const { selectedElId, deleteElement } = get(); if (selectedElId) deleteElement(selectedElId); },

  deleteSelectedMulti: () => set(state => {
    const ids = state.selectedElIds;
    if (ids.size === 0) return state;
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].filter(el => !ids.has(el.id));
    const newSnaps = { ...state.snaps };
    ids.forEach(id => { delete newSnaps[id]; });
    return {
      sideElements: newElements, selectedElId: null, selectedElIds: new Set(),
      snaps: newSnaps, undoStack, redoStack: [],
      price: calcPrice(state.currentCabinet, newElements),
      toastMessage: `Deleted ${ids.size} element${ids.size > 1 ? 's' : ''}`, toastIcon: '🗑',
    };
  }),

  clearCurrentSide: () => set(state => {
    const side = state.currentSide;
    if (state.sideElements[side].length === 0 && state.sideAlignments[side].length === 0 && state.sideConstraints[side].length === 0) return state;
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[side] = [];
    const newAlignments = { ...state.sideAlignments };
    newAlignments[side] = [];
    const newConstraints = { ...state.sideConstraints };
    newConstraints[side] = [];
    const removedAlignIds = new Set(state.sideAlignments[side].map(a => a.id));
    const newSnaps: SnapMap = {};
    for (const [elId, s] of Object.entries(state.snaps)) {
      if (!removedAlignIds.has(s.alignId)) newSnaps[Number(elId)] = s;
    }
    return {
      sideElements: newElements, sideAlignments: newAlignments, sideConstraints: newConstraints, snaps: newSnaps,
      selectedElId: null, selectedAlignId: null, selectedConstraintId: null, undoStack, redoStack: [],
      price: calcPrice(state.currentCabinet, newElements),
      toastMessage: 'Side cleared', toastIcon: '🗑',
    };
  }),

  /* ─── Alignment Actions ─── */

  addAlignment: (type, pw, ph) => set(state => {
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newAlign: AlignmentElement = {
      id: state.nextId,
      type: type === 'circular' ? 'align-circular' : 'align-rectangular',
      x: Math.round(pw / 2),
      y: Math.round(ph / 2),
      diameter: type === 'circular' ? 30 : 60,
      count: type === 'circular' ? 3 : 3,
      rows: type === 'rectangular' ? 1 : 1,
      cols: type === 'rectangular' ? 3 : 1,
      spacingX: 30,
      spacingY: 30,
    };
    const newAlignments = { ...state.sideAlignments };
    newAlignments[state.currentSide] = [...newAlignments[state.currentSide], newAlign];
    return {
      sideAlignments: newAlignments,
      selectedAlignId: newAlign.id, selectedElId: null, selectedElIds: new Set(),
      nextId: state.nextId + 1, undoStack, redoStack: [],
      toastMessage: `Added ${type} alignment`, toastIcon: '📐',
    };
  }),

  selectAlignment: (id) => set({ selectedAlignId: id, selectedElId: null, selectedElIds: new Set() }),

  moveAlignment: (id, x, y) => set(state => {
    const side = state.currentSide;
    const alignments = [...state.sideAlignments[side]];
    const idx = alignments.findIndex(a => a.id === id);
    if (idx === -1) return state;
    const old = alignments[idx];
    const dx = x - old.x;
    const dy = y - old.y;
    alignments[idx] = { ...old, x, y };
    const snappedElIds = Object.entries(state.snaps)
      .filter(([, s]) => s.alignId === id)
      .map(([elId]) => Number(elId));
    let newSideElements = state.sideElements;
    if (snappedElIds.length > 0) {
      newSideElements = { ...state.sideElements };
      newSideElements[side] = newSideElements[side].map(el => {
        if (!snappedElIds.includes(el.id)) return el;
        return { ...el, x: Math.round(el.x + dx), y: Math.round(el.y + dy) };
      });
    }
    return { sideAlignments: { ...state.sideAlignments, [side]: alignments }, sideElements: newSideElements };
  }),

  updateAlignmentProp: (id, prop, value) => set(state => {
    const side = state.currentSide;
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const alignments = [...state.sideAlignments[side]];
    const idx = alignments.findIndex(a => a.id === id);
    if (idx === -1) return state;
    const updated = { ...alignments[idx], [prop]: value };
    alignments[idx] = updated;
    // Reposition snapped elements to new snap points
    const newSnapPoints = getAlignSnapPoints(updated);
    const newSideElements = { ...state.sideElements };
    const sideEls = [...newSideElements[side]];
    let changed = false;
    const newSnaps: SnapMap = { ...state.snaps };
    for (const [elIdStr, s] of Object.entries(state.snaps)) {
      if (s.alignId !== id) continue;
      if (s.snapIdx >= newSnapPoints.length) { delete newSnaps[Number(elIdStr)]; continue; }
      const pt = newSnapPoints[s.snapIdx];
      const elIdx = sideEls.findIndex(e => e.id === Number(elIdStr));
      if (elIdx === -1) continue;
      const el = sideEls[elIdx];
      sideEls[elIdx] = { ...el, x: Math.round(pt.x - el.w / 2), y: Math.round(pt.y - el.h / 2) };
      changed = true;
    }
    if (changed) newSideElements[side] = sideEls;
    return {
      sideAlignments: { ...state.sideAlignments, [side]: alignments },
      sideElements: changed ? newSideElements : state.sideElements,
      snaps: newSnaps, undoStack, redoStack: [],
    };
  }),

  deleteAlignment: (id) => set(state => {
    const side = state.currentSide;
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newAlignments = { ...state.sideAlignments };
    newAlignments[side] = newAlignments[side].filter(a => a.id !== id);
    const newSnaps: SnapMap = {};
    for (const [elId, s] of Object.entries(state.snaps)) {
      if (s.alignId !== id) newSnaps[Number(elId)] = s;
    }
    return {
      sideAlignments: newAlignments,
      selectedAlignId: state.selectedAlignId === id ? null : state.selectedAlignId,
      snaps: newSnaps, undoStack, redoStack: [],
      toastMessage: 'Alignment deleted', toastIcon: '🗑',
    };
  }),

  currentAlignments: () => { const s = get(); return s.sideAlignments[s.currentSide]; },

  snapElement: (elId, alignId, snapIdx) => set(state => {
    const side = state.currentSide;
    const align = state.sideAlignments[side].find(a => a.id === alignId);
    if (!align) return state;
    const pts = getAlignSnapPoints(align);
    const pt = pts[snapIdx];
    if (!pt) return state;
    const newElements = { ...state.sideElements };
    newElements[side] = newElements[side].map(el => {
      if (el.id !== elId) return el;
      return { ...el, x: Math.round(pt.x - el.w / 2), y: Math.round(pt.y - el.h / 2) };
    });
    return { snaps: { ...state.snaps, [elId]: { alignId, snapIdx } }, sideElements: newElements };
  }),

  unsnapElement: (elId) => set(state => {
    const newSnaps = { ...state.snaps };
    delete newSnaps[elId];
    return { snaps: newSnaps };
  }),

  /* ─── Constraint Actions ─── */

  addConstraint: (fromRef, toRef, axis, value) => set(state => {
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const c: Constraint = { id: state.nextId, fromRef, toRef, axis, value };
    const newConstraints = { ...state.sideConstraints };
    newConstraints[state.currentSide] = [...newConstraints[state.currentSide], c];
    return {
      sideConstraints: newConstraints,
      selectedConstraintId: c.id, selectedElId: null, selectedElIds: new Set(), selectedAlignId: null,
      nextId: state.nextId + 1, undoStack, redoStack: [],
      toastMessage: 'Constraint added', toastIcon: '📏',
    };
  }),

  selectConstraint: (id) => set({ selectedConstraintId: id, selectedElId: null, selectedElIds: new Set(), selectedAlignId: null }),

  updateConstraintValue: (id, value, pw, ph) => set(state => {
    const side = state.currentSide;
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const constraints = [...state.sideConstraints[side]];
    const idx = constraints.findIndex(c => c.id === id);
    if (idx === -1) return state;
    const c = { ...constraints[idx], value: Math.max(0, value) };
    constraints[idx] = c;
    // Move the target element to satisfy the constraint
    const newElements = { ...state.sideElements };
    const sideEls = [...newElements[side]];
    const toIdx = sideEls.findIndex(e => e.id === c.toRef);
    if (toIdx !== -1) {
      const el = { ...sideEls[toIdx] };
      if (typeof c.fromRef === 'string') {
        // Border reference
        if (c.axis === 'x') {
          if (c.fromRef === 'border-left') el.x = Math.round(Math.max(0, Math.min(pw - el.w, c.value)));
          else if (c.fromRef === 'border-right') el.x = Math.round(Math.max(0, Math.min(pw - el.w, pw - c.value - el.w)));
        } else {
          if (c.fromRef === 'border-bottom') el.y = Math.round(Math.max(0, Math.min(ph - el.h, ph - c.value - el.h)));
        }
      } else {
        // Element-to-element reference
        const fromEl = sideEls.find(e => e.id === c.fromRef);
        if (fromEl) {
          if (c.axis === 'x') {
            el.x = Math.round(Math.max(0, Math.min(pw - el.w, fromEl.x + fromEl.w + c.value)));
          } else {
            el.y = Math.round(Math.max(0, Math.min(ph - el.h, fromEl.y + fromEl.h + c.value)));
          }
        }
      }
      sideEls[toIdx] = el;
      newElements[side] = sideEls;
    }
    return {
      sideConstraints: { ...state.sideConstraints, [side]: constraints },
      sideElements: newElements,
      undoStack, redoStack: [],
      price: calcPrice(state.currentCabinet, newElements),
    };
  }),

  deleteConstraint: (id) => set(state => {
    const side = state.currentSide;
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)].slice(-MAX_UNDO);
    const newConstraints = { ...state.sideConstraints };
    newConstraints[side] = newConstraints[side].filter(c => c.id !== id);
    return {
      sideConstraints: newConstraints,
      selectedConstraintId: state.selectedConstraintId === id ? null : state.selectedConstraintId,
      undoStack, redoStack: [],
      toastMessage: 'Constraint deleted', toastIcon: '🗑',
    };
  }),

  currentConstraints: () => { const s = get(); return s.sideConstraints[s.currentSide]; },

  /* ─── Undo / Redo ─── */

  undo: () => set(state => {
    if (!state.undoStack.length) return state;
    const redoStack = [...state.redoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)];
    const undoStack = [...state.undoStack];
    const restored = undoStack.pop()!;
    return {
      sideElements: restored.se, sideAlignments: restored.al, snaps: restored.sn,
      sideConstraints: restored.co,
      undoStack, redoStack, selectedElId: null, selectedAlignId: null, selectedElIds: new Set(), selectedConstraintId: null,
      price: calcPrice(state.currentCabinet, restored.se), toastMessage: 'Undone', toastIcon: '↩',
    };
  }),

  redo: () => set(state => {
    if (!state.redoStack.length) return state;
    const undoStack = [...state.undoStack, cloneSnapshot(state.sideElements, state.sideAlignments, state.snaps, state.sideConstraints)];
    const redoStack = [...state.redoStack];
    const restored = redoStack.pop()!;
    return {
      sideElements: restored.se, sideAlignments: restored.al, snaps: restored.sn,
      sideConstraints: restored.co,
      undoStack, redoStack, selectedElId: null, selectedAlignId: null, selectedElIds: new Set(), selectedConstraintId: null,
      price: calcPrice(state.currentCabinet, restored.se), toastMessage: 'Redone', toastIcon: '↪',
    };
  }),

  addToCart: () => set(state => {
    let n = 0;
    SIDES.forEach(s => { n += state.sideElements[s].length; });
    return { cartItems: state.cartItems + 1, toastMessage: `Cabinet added to cart (${n} cutout${n !== 1 ? 's' : ''})`, toastIcon: '🛒' };
  }),

  setZoom: (level) => set({ zoomLevel: Math.max(0.4, Math.min(2, level)) }),
  showToast: (msg, icon = '✓') => set({ toastMessage: msg, toastIcon: icon }),
  clearToast: () => set({ toastMessage: null }),
  sideHasEdits: (side) => { const s = get(); return s.sideElements[side].length > 0 || s.sideAlignments[side].length > 0 || s.sideConstraints[side].length > 0; },
  currentElements: () => { const s = get(); return s.sideElements[s.currentSide]; },

  loadProject: (cabinetKey, sideElements) => set(() => ({
    currentCabinet: cabinetKey,
    sideElements: JSON.parse(JSON.stringify(sideElements)),
    sideAlignments: emptyAlignments(),
    sideConstraints: emptyConstraints(),
    snaps: {},
    selectedElId: null, selectedAlignId: null, selectedConstraintId: null,
    currentSide: 'front' as Side,
    undoStack: [], redoStack: [],
    nextId: Math.max(...Object.values(sideElements).flat().map(e => e.id), 0) + 1,
    price: calcPrice(cabinetKey, sideElements),
  })),

  resetProject: () => set({
    sideElements: emptySideElements(),
    sideAlignments: emptyAlignments(),
    sideConstraints: emptyConstraints(),
    snaps: {},
    selectedElId: null, selectedAlignId: null, selectedConstraintId: null,
    currentSide: 'front' as Side,
    undoStack: [], redoStack: [],
    nextId: 1, activeTool: 'hole' as ToolType,
  }),
}));
