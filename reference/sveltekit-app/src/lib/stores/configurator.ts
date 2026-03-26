import { writable, derived, get } from 'svelte/store';
import type { Side, ToolType, ViewMode, CabinetKey, PanelElement, SideElements } from '$lib/types';
import { SIDES, MAX_UNDO } from '$lib/constants';

function createEmptySides(): SideElements {
  return Object.fromEntries(SIDES.map(s => [s, []])) as SideElements;
}

function createConfigurator() {
  const cabinet = writable<CabinetKey>('standard');
  const currentSide = writable<Side>('front');
  const tool = writable<ToolType>('move');
  const viewMode = writable<ViewMode>('3d');
  const zoom = writable(1);
  const selectedId = writable<string | null>(null);
  const sideElements = writable<SideElements>(createEmptySides());
  const undoStack = writable<SideElements[]>([]);
  const redoStack = writable<SideElements[]>([]);
  const cartItems = writable<{ cabinet: CabinetKey; config: SideElements }[]>([]);
  const toast = writable<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  function pushUndo() {
    const current = structuredClone(get(sideElements));
    undoStack.update(s => {
      const next = [...s, current];
      if (next.length > MAX_UNDO) next.shift();
      return next;
    });
    redoStack.set([]);
  }

  function setCabinet(key: CabinetKey) {
    pushUndo();
    cabinet.set(key);
    sideElements.set(createEmptySides());
    selectedId.set(null);
  }

  function setSide(side: Side) {
    currentSide.set(side);
    selectedId.set(null);
  }

  function setTool(t: ToolType) {
    tool.set(t);
    if (t !== 'move') selectedId.set(null);
  }

  function selectElement(id: string | null) {
    selectedId.set(id);
    if (id) tool.set('move');
  }

  function addElement(element: PanelElement) {
    pushUndo();
    const side = get(currentSide);
    sideElements.update(se => {
      const copy = structuredClone(se);
      copy[side] = [...copy[side], element];
      return copy;
    });
    selectedId.set(element.id);
    tool.set('move');
  }

  function moveElement(id: string, x: number, y: number) {
    pushUndo();
    const side = get(currentSide);
    sideElements.update(se => {
      const copy = structuredClone(se);
      copy[side] = copy[side].map(el => el.id === id ? { ...el, x, y } : el);
      return copy;
    });
  }

  function updateElementProp(id: string, prop: string, value: number | string) {
    pushUndo();
    const side = get(currentSide);
    sideElements.update(se => {
      const copy = structuredClone(se);
      copy[side] = copy[side].map(el => el.id === id ? { ...el, [prop]: value } : el);
      return copy;
    });
  }

  function deleteElement(id: string) {
    pushUndo();
    const side = get(currentSide);
    sideElements.update(se => {
      const copy = structuredClone(se);
      copy[side] = copy[side].filter(el => el.id !== id);
      return copy;
    });
    selectedId.update(sel => sel === id ? null : sel);
  }

  function clearCurrentSide() {
    pushUndo();
    const side = get(currentSide);
    sideElements.update(se => {
      const copy = structuredClone(se);
      copy[side] = [];
      return copy;
    });
    selectedId.set(null);
  }

  function undo() {
    const stack = get(undoStack);
    if (!stack.length) return;
    const current = structuredClone(get(sideElements));
    const prev = stack[stack.length - 1];
    undoStack.update(s => s.slice(0, -1));
    redoStack.update(s => [...s, current]);
    sideElements.set(prev);
    selectedId.set(null);
  }

  function redo() {
    const stack = get(redoStack);
    if (!stack.length) return;
    const current = structuredClone(get(sideElements));
    const next = stack[stack.length - 1];
    redoStack.update(s => s.slice(0, -1));
    undoStack.update(s => [...s, current]);
    sideElements.set(next);
    selectedId.set(null);
  }

  function addToCart() {
    const cab = get(cabinet);
    const els = structuredClone(get(sideElements));
    cartItems.update(items => [...items, { cabinet: cab, config: els }]);
    showToast('Configuration added to cart!', 'success');
  }

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (toastTimer) clearTimeout(toastTimer);
    toast.set({ message, type });
    toastTimer = setTimeout(() => toast.set(null), 3000);
  }

  function clearToast() {
    if (toastTimer) clearTimeout(toastTimer);
    toast.set(null);
  }

  const currentElements = derived([sideElements, currentSide], ([$se, $side]) => $se[$side]);

  const selectedElement = derived([currentElements, selectedId], ([$els, $id]) =>
    $id ? $els.find(el => el.id === $id) ?? null : null
  );

  return {
    // stores (readable)
    cabinet, currentSide, tool, viewMode, zoom, selectedId,
    sideElements, undoStack, redoStack, cartItems, toast,
    // derived
    currentElements, selectedElement,
    // actions
    setCabinet, setSide, setTool, selectElement,
    addElement, moveElement, updateElementProp, deleteElement, clearCurrentSide,
    undo, redo, addToCart, showToast, clearToast, setZoom: zoom.set,
  };
}

export const configurator = createConfigurator();
