import { create } from 'zustand';
import type { CabinetKey, Side, ToolType, ElementType, PanelElement, SideElements } from './types';
import { SIDES, ELEMENT_DEFAULTS, MAX_UNDO, snap, calcPrice } from './constants';

function emptySides(): SideElements {
  return Object.fromEntries(SIDES.map(s => [s, []])) as SideElements;
}
function clone(se: SideElements): SideElements { return JSON.parse(JSON.stringify(se)); }

interface State {
  currentCabinet: CabinetKey;
  currentSide: Side;
  activeTool: ToolType;
  selectedElId: number | null;
  nextId: number;
  cartItems: number;
  zoomLevel: number;
  sideElements: SideElements;
  undoStack: SideElements[];
  redoStack: SideElements[];
  toastMessage: string | null;
  toastIcon: string;
  price: number;
}

interface Actions {
  setCabinet: (k: CabinetKey) => void;
  setSide: (s: Side) => void;
  setTool: (t: ToolType) => void;
  selectElement: (id: number | null) => void;
  addElement: (type: ElementType, x: number, y: number, cw: number, ch: number) => void;
  moveElement: (id: number, x: number, y: number) => void;
  updateElementProp: (id: number, prop: string, value: number) => void;
  deleteElement: (id: number) => void;
  deleteSelected: () => void;
  clearCurrentSide: () => void;
  undo: () => void;
  redo: () => void;
  addToCart: () => void;
  setZoom: (l: number) => void;
  showToast: (msg: string, icon?: string) => void;
  clearToast: () => void;
}

export const useConfiguratorStore = create<State & Actions>((set, get) => ({
  currentCabinet: 'compact',
  currentSide: 'front',
  activeTool: 'hole',
  selectedElId: null,
  nextId: 1,
  cartItems: 0,
  zoomLevel: 1,
  sideElements: emptySides(),
  undoStack: [],
  redoStack: [],
  toastMessage: null,
  toastIcon: '✓',
  price: 320,

  setCabinet(k) {
    set(s => ({ currentCabinet: k, price: calcPrice(k, s.sideElements) }));
  },
  setSide(side) { set({ currentSide: side, selectedElId: null }); },
  setTool(t) { set({ activeTool: t }); },
  selectElement(id) { set({ selectedElId: id }); },

  addElement(type, x, y, cw, ch) {
    const s = get();
    const d = ELEMENT_DEFAULTS[type];
    const el: PanelElement = {
      id: s.nextId, type,
      x: snap(Math.max(0, Math.min(cw - d.w, x - d.w / 2))),
      y: snap(Math.max(0, Math.min(ch - d.h, y - d.h / 2))),
      w: d.w, h: d.h,
      ...(type === 'hole' ? { diameter: (d as { diameter: number }).diameter } : {}),
    };
    const newElements = { ...s.sideElements, [s.currentSide]: [...s.sideElements[s.currentSide], el] };
    set({
      undoStack: [...s.undoStack, clone(s.sideElements)].slice(-MAX_UNDO),
      redoStack: [],
      sideElements: newElements,
      nextId: s.nextId + 1,
      selectedElId: el.id,
      price: calcPrice(s.currentCabinet, newElements),
    });
  },

  moveElement(id, x, y) {
    set(s => ({
      sideElements: {
        ...s.sideElements,
        [s.currentSide]: s.sideElements[s.currentSide].map(el =>
          el.id === id ? { ...el, x: snap(x), y: snap(y) } : el
        ),
      },
    }));
  },

  updateElementProp(id, prop, value) {
    const s = get();
    const newElements = {
      ...s.sideElements,
      [s.currentSide]: s.sideElements[s.currentSide].map(el => {
        if (el.id !== id) return el;
        const u = { ...el, [prop]: value };
        if (prop === 'diameter' && el.type === 'hole') { u.w = Math.round(value * 36 / 22); u.h = u.w; }
        return u;
      }),
    };
    set({
      undoStack: [...s.undoStack, clone(s.sideElements)].slice(-MAX_UNDO),
      redoStack: [],
      sideElements: newElements,
      price: calcPrice(s.currentCabinet, newElements),
    });
  },

  deleteElement(id) {
    const s = get();
    const newElements = {
      ...s.sideElements,
      [s.currentSide]: s.sideElements[s.currentSide].filter(el => el.id !== id),
    };
    set({
      undoStack: [...s.undoStack, clone(s.sideElements)].slice(-MAX_UNDO),
      redoStack: [],
      sideElements: newElements,
      selectedElId: s.selectedElId === id ? null : s.selectedElId,
      price: calcPrice(s.currentCabinet, newElements),
    });
  },

  deleteSelected() { const id = get().selectedElId; if (id !== null) get().deleteElement(id); },

  clearCurrentSide() {
    const s = get();
    if (s.sideElements[s.currentSide].length === 0) return;
    const newEls = { ...s.sideElements, [s.currentSide]: [] };
    set({
      undoStack: [...s.undoStack, clone(s.sideElements)].slice(-MAX_UNDO),
      redoStack: [],
      sideElements: newEls,
      selectedElId: null,
      price: calcPrice(s.currentCabinet, newEls),
      toastMessage: 'Side cleared', toastIcon: '🗑',
    });
  },

  undo() {
    const s = get();
    if (!s.undoStack.length) return;
    const prev = s.undoStack[s.undoStack.length - 1];
    set({
      redoStack: [...s.redoStack, clone(s.sideElements)],
      undoStack: s.undoStack.slice(0, -1),
      sideElements: prev,
      selectedElId: null,
      price: calcPrice(s.currentCabinet, prev),
      toastMessage: 'Undone', toastIcon: '↩',
    });
  },

  redo() {
    const s = get();
    if (!s.redoStack.length) return;
    const next = s.redoStack[s.redoStack.length - 1];
    set({
      undoStack: [...s.undoStack, clone(s.sideElements)],
      redoStack: s.redoStack.slice(0, -1),
      sideElements: next,
      selectedElId: null,
      price: calcPrice(s.currentCabinet, next),
      toastMessage: 'Redone', toastIcon: '↪',
    });
  },

  addToCart() {
    const s = get();
    let n = 0; SIDES.forEach(side => n += s.sideElements[side].length);
    set({ cartItems: s.cartItems + 1, toastMessage: `Cabinet added (${n} cutout${n !== 1 ? 's' : ''})`, toastIcon: '🛒' });
  },

  setZoom(l) { set({ zoomLevel: Math.max(0.4, Math.min(2, l)) }); },
  showToast(msg, icon = '✓') { set({ toastMessage: msg, toastIcon: icon }); },
  clearToast() { set({ toastMessage: null }); },
}));
