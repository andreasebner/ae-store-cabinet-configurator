import { defineStore } from 'pinia';
import type { CabinetKey, Side, ToolType, ElementType, PanelElement, SideElements } from '~/utils/types';
import { SIDES, ELEMENT_DEFAULTS, MAX_UNDO, snap, calcPrice } from '~/utils/constants';

function emptySideElements(): SideElements {
  return Object.fromEntries(SIDES.map(s => [s, []])) as SideElements;
}

function cloneState(se: SideElements): SideElements {
  return JSON.parse(JSON.stringify(se));
}

export const useConfiguratorStore = defineStore('configurator', {
  state: () => ({
    currentCabinet: 'compact' as CabinetKey,
    currentSide: 'front' as Side,
    activeTool: 'hole' as ToolType,
    selectedElId: null as number | null,
    nextId: 1,
    cartItems: 0,
    zoomLevel: 1,
    sideElements: emptySideElements(),
    undoStack: [] as SideElements[],
    redoStack: [] as SideElements[],
    toastMessage: null as string | null,
    toastIcon: '✓',
    price: 320,
  }),

  getters: {
    currentElements(state): PanelElement[] {
      return state.sideElements[state.currentSide];
    },
  },

  actions: {
    setCabinet(key: CabinetKey) {
      this.currentCabinet = key;
      this.price = calcPrice(key, this.sideElements);
    },
    setSide(side: Side) {
      this.currentSide = side;
      this.selectedElId = null;
    },
    setTool(tool: ToolType) {
      this.activeTool = tool;
    },
    selectElement(id: number | null) {
      this.selectedElId = id;
    },
    pushUndo() {
      this.undoStack.push(cloneState(this.sideElements));
      if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
      this.redoStack = [];
    },
    addElement(type: ElementType, clickX: number, clickY: number, canvasW: number, canvasH: number) {
      const defaults = ELEMENT_DEFAULTS[type];
      const w = defaults.w;
      const h = defaults.h;
      const x = snap(Math.max(0, Math.min(canvasW - w, clickX - w / 2)));
      const y = snap(Math.max(0, Math.min(canvasH - h, clickY - h / 2)));

      this.pushUndo();
      const newEl: PanelElement = {
        id: this.nextId++,
        type, x, y, w, h,
        ...(type === 'hole' ? { diameter: (defaults as typeof ELEMENT_DEFAULTS.hole).diameter } : {}),
      };
      this.sideElements[this.currentSide].push(newEl);
      this.selectedElId = newEl.id;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
    },
    moveElement(id: number, x: number, y: number) {
      const el = this.sideElements[this.currentSide].find(e => e.id === id);
      if (el) { el.x = snap(x); el.y = snap(y); }
    },
    updateElementProp(id: number, prop: string, value: number) {
      this.pushUndo();
      const el = this.sideElements[this.currentSide].find(e => e.id === id);
      if (!el) return;
      (el as any)[prop] = value;
      if (prop === 'diameter' && el.type === 'hole') {
        el.w = Math.round(value * 36 / 22);
        el.h = el.w;
      }
      this.price = calcPrice(this.currentCabinet, this.sideElements);
    },
    deleteElement(id: number) {
      this.pushUndo();
      const idx = this.sideElements[this.currentSide].findIndex(e => e.id === id);
      if (idx !== -1) this.sideElements[this.currentSide].splice(idx, 1);
      if (this.selectedElId === id) this.selectedElId = null;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
    },
    deleteSelected() {
      if (this.selectedElId) this.deleteElement(this.selectedElId);
    },
    clearCurrentSide() {
      if (this.sideElements[this.currentSide].length === 0) return;
      this.pushUndo();
      this.sideElements[this.currentSide] = [];
      this.selectedElId = null;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
      this.showToast('Side cleared', '🗑');
    },
    undo() {
      if (this.undoStack.length === 0) return;
      this.redoStack.push(cloneState(this.sideElements));
      const restored = this.undoStack.pop()!;
      SIDES.forEach(s => { this.sideElements[s] = restored[s]; });
      this.selectedElId = null;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
      this.showToast('Undone', '↩');
    },
    redo() {
      if (this.redoStack.length === 0) return;
      this.undoStack.push(cloneState(this.sideElements));
      const restored = this.redoStack.pop()!;
      SIDES.forEach(s => { this.sideElements[s] = restored[s]; });
      this.selectedElId = null;
      this.price = calcPrice(this.currentCabinet, this.sideElements);
      this.showToast('Redone', '↪');
    },
    addToCart() {
      let totalEls = 0;
      SIDES.forEach(s => { totalEls += this.sideElements[s].length; });
      this.cartItems++;
      this.showToast(`Cabinet added to cart (${totalEls} cutout${totalEls !== 1 ? 's' : ''})`, '🛒');
    },
    setZoom(level: number) {
      this.zoomLevel = Math.max(0.4, Math.min(2, level));
    },
    showToast(msg: string, icon: string = '✓') {
      this.toastMessage = msg;
      this.toastIcon = icon;
    },
    clearToast() {
      this.toastMessage = null;
    },
    sideHasEdits(side: Side): boolean {
      return this.sideElements[side].length > 0;
    },
  },
});
