import { defineStore } from 'pinia';
import type { CabinetKey, Side, ToolType, ElementType, PanelElement, SideElements } from '~/utils/types';
import { SIDES, ELEMENT_DEFAULTS, MAX_UNDO, snap, calcPrice } from '~/utils/constants';

function emptySides(): SideElements {
  return Object.fromEntries(SIDES.map(s => [s, []])) as SideElements;
}
function clone(se: SideElements): SideElements { return JSON.parse(JSON.stringify(se)); }

export const useConfiguratorStore = defineStore('configurator', {
  state: () => ({
    currentCabinet: 'compact' as CabinetKey,
    currentSide: 'front' as Side,
    activeTool: 'hole' as ToolType,
    selectedElId: null as number | null,
    nextId: 1,
    cartItems: 0,
    zoomLevel: 1,
    sideElements: emptySides(),
    undoStack: [] as SideElements[],
    redoStack: [] as SideElements[],
    toastMessage: null as string | null,
    toastIcon: '✓',
    toastColor: 'success',
    price: 320,
  }),

  getters: {
    currentElements: (state) => state.sideElements[state.currentSide],
    sideHasEdits: (state) => (side: Side) => state.sideElements[side].length > 0,
  },

  actions: {
    setCabinet(key: CabinetKey) {
      this.currentCabinet = key;
      this.price = calcPrice(key, this.sideElements);
    },
    setSide(side: Side) { this.currentSide = side; this.selectedElId = null; },
    setTool(tool: ToolType) { this.activeTool = tool; },
    selectElement(id: number | null) { this.selectedElId = id; },

    addElement(type: ElementType, x: number, y: number, cw: number, ch: number) {
      const d = ELEMENT_DEFAULTS[type];
      const el: PanelElement = {
        id: this.nextId++, type,
        x: snap(Math.max(0, Math.min(cw - d.w, x - d.w / 2))),
        y: snap(Math.max(0, Math.min(ch - d.h, y - d.h / 2))),
        w: d.w, h: d.h,
        ...(type === 'hole' ? { diameter: d.diameter } : {}),
      };
      this.undoStack = [...this.undoStack, clone(this.sideElements)].slice(-MAX_UNDO);
      this.redoStack = [];
      this.sideElements[this.currentSide] = [...this.sideElements[this.currentSide], el];
      this.selectedElId = el.id;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
    },

    moveElement(id: number, x: number, y: number) {
      this.sideElements[this.currentSide] = this.sideElements[this.currentSide].map(
        el => el.id === id ? { ...el, x: snap(x), y: snap(y) } : el
      );
    },

    updateElementProp(id: number, prop: string, value: number) {
      this.undoStack = [...this.undoStack, clone(this.sideElements)].slice(-MAX_UNDO);
      this.redoStack = [];
      this.sideElements[this.currentSide] = this.sideElements[this.currentSide].map(el => {
        if (el.id !== id) return el;
        const u = { ...el, [prop]: value };
        if (prop === 'diameter' && el.type === 'hole') { u.w = Math.round(value * 36 / 22); u.h = u.w; }
        return u;
      });
      this.price = calcPrice(this.currentCabinet, this.sideElements);
    },

    deleteElement(id: number) {
      this.undoStack = [...this.undoStack, clone(this.sideElements)].slice(-MAX_UNDO);
      this.redoStack = [];
      this.sideElements[this.currentSide] = this.sideElements[this.currentSide].filter(el => el.id !== id);
      if (this.selectedElId === id) this.selectedElId = null;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
    },

    deleteSelected() { if (this.selectedElId !== null) this.deleteElement(this.selectedElId); },

    clearCurrentSide() {
      if (this.sideElements[this.currentSide].length === 0) return;
      this.undoStack = [...this.undoStack, clone(this.sideElements)].slice(-MAX_UNDO);
      this.redoStack = [];
      this.sideElements[this.currentSide] = [];
      this.selectedElId = null;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
      this.showToast('Side cleared', 'mdi-delete-outline', 'warning');
    },

    undo() {
      if (!this.undoStack.length) return;
      this.redoStack = [...this.redoStack, clone(this.sideElements)];
      this.sideElements = this.undoStack.pop()!;
      this.selectedElId = null;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
      this.showToast('Undone', 'mdi-undo', 'info');
    },

    redo() {
      if (!this.redoStack.length) return;
      this.undoStack = [...this.undoStack, clone(this.sideElements)];
      this.sideElements = this.redoStack.pop()!;
      this.selectedElId = null;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
      this.showToast('Redone', 'mdi-redo', 'info');
    },

    addToCart() {
      let n = 0; SIDES.forEach(s => n += this.sideElements[s].length);
      this.cartItems++;
      this.showToast(`Cabinet added to cart (${n} cutout${n !== 1 ? 's' : ''})`, 'mdi-cart-check', 'success');
    },

    setZoom(l: number) { this.zoomLevel = Math.max(0.4, Math.min(2, l)); },

    showToast(msg: string, icon = 'mdi-check', color = 'success') {
      this.toastMessage = msg; this.toastIcon = icon; this.toastColor = color;
    },
    clearToast() { this.toastMessage = null; },
  },
});
