import { create } from 'zustand';
import type { CabinetKey, Side, ToolType, ElementType, PanelElement, SideElements } from '@/lib/types';
import { SIDES, ELEMENT_DEFAULTS, MAX_UNDO, snap, calcPrice } from '@/lib/constants';

function emptySideElements(): SideElements {
  return Object.fromEntries(SIDES.map(s => [s, []])) as SideElements;
}

function cloneState(se: SideElements): SideElements {
  return JSON.parse(JSON.stringify(se));
}

interface ConfiguratorStore {
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

  setCabinet: (key: CabinetKey) => void;
  setSide: (side: Side) => void;
  setTool: (tool: ToolType) => void;
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
  nextId: 1,
  cartItems: 0,
  zoomLevel: 1,
  sideElements: emptySideElements(),
  undoStack: [],
  redoStack: [],
  toastMessage: null,
  toastIcon: '✓',
  price: 320,

  setCabinet: (key) => set(state => ({
    currentCabinet: key,
    price: calcPrice(key, state.sideElements),
  })),
  setSide: (side) => set({ currentSide: side, selectedElId: null }),
  setTool: (tool) => set({ activeTool: tool }),
  selectElement: (id) => set({ selectedElId: id }),

  addElement: (type, clickX, clickY, canvasW, canvasH) => {
    const state = get();
    const d = ELEMENT_DEFAULTS[type];
    const x = snap(Math.max(0, Math.min(canvasW - d.w, clickX - d.w / 2)));
    const y = snap(Math.max(0, Math.min(canvasH - d.h, clickY - d.h / 2)));
    const newEl: PanelElement = {
      id: state.nextId, type, x, y, w: d.w, h: d.h,
      ...(type === 'hole' ? { diameter: d.diameter } : {}),
    };
    const undoStack = [...state.undoStack, cloneState(state.sideElements)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = [...newElements[state.currentSide], newEl];
    set({
      sideElements: newElements, selectedElId: state.nextId,
      nextId: state.nextId + 1, undoStack, redoStack: [],
      price: calcPrice(state.currentCabinet, newElements),
    });
  },

  moveElement: (id, x, y) => set(state => {
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].map(el =>
      el.id === id ? { ...el, x: snap(x), y: snap(y) } : el
    );
    return { sideElements: newElements };
  }),

  updateElementProp: (id, prop, value) => set(state => {
    const undoStack = [...state.undoStack, cloneState(state.sideElements)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].map(el => {
      if (el.id !== id) return el;
      const u = { ...el, [prop]: value };
      if (prop === 'diameter' && el.type === 'hole') { u.w = Math.round(value * 36 / 22); u.h = u.w; }
      return u;
    });
    return { sideElements: newElements, undoStack, redoStack: [], price: calcPrice(state.currentCabinet, newElements) };
  }),

  deleteElement: (id) => set(state => {
    const undoStack = [...state.undoStack, cloneState(state.sideElements)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = newElements[state.currentSide].filter(el => el.id !== id);
    return {
      sideElements: newElements,
      selectedElId: state.selectedElId === id ? null : state.selectedElId,
      undoStack, redoStack: [],
      price: calcPrice(state.currentCabinet, newElements),
    };
  }),

  deleteSelected: () => { const { selectedElId, deleteElement } = get(); if (selectedElId) deleteElement(selectedElId); },

  clearCurrentSide: () => set(state => {
    if (state.sideElements[state.currentSide].length === 0) return state;
    const undoStack = [...state.undoStack, cloneState(state.sideElements)].slice(-MAX_UNDO);
    const newElements = { ...state.sideElements };
    newElements[state.currentSide] = [];
    return {
      sideElements: newElements, selectedElId: null, undoStack, redoStack: [],
      price: calcPrice(state.currentCabinet, newElements),
      toastMessage: 'Side cleared', toastIcon: '🗑',
    };
  }),

  undo: () => set(state => {
    if (!state.undoStack.length) return state;
    const redoStack = [...state.redoStack, cloneState(state.sideElements)];
    const undoStack = [...state.undoStack];
    const restored = undoStack.pop()!;
    return { sideElements: restored, undoStack, redoStack, selectedElId: null, price: calcPrice(state.currentCabinet, restored), toastMessage: 'Undone', toastIcon: '↩' };
  }),

  redo: () => set(state => {
    if (!state.redoStack.length) return state;
    const undoStack = [...state.undoStack, cloneState(state.sideElements)];
    const redoStack = [...state.redoStack];
    const restored = redoStack.pop()!;
    return { sideElements: restored, undoStack, redoStack, selectedElId: null, price: calcPrice(state.currentCabinet, restored), toastMessage: 'Redone', toastIcon: '↪' };
  }),

  addToCart: () => set(state => {
    let n = 0;
    SIDES.forEach(s => { n += state.sideElements[s].length; });
    return { cartItems: state.cartItems + 1, toastMessage: `Cabinet added to cart (${n} cutout${n !== 1 ? 's' : ''})`, toastIcon: '🛒' };
  }),

  setZoom: (level) => set({ zoomLevel: Math.max(0.4, Math.min(2, level)) }),
  showToast: (msg, icon = '✓') => set({ toastMessage: msg, toastIcon: icon }),
  clearToast: () => set({ toastMessage: null }),
  sideHasEdits: (side) => get().sideElements[side].length > 0,
  currentElements: () => { const s = get(); return s.sideElements[s.currentSide]; },
}));
