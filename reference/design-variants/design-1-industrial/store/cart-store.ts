import { create } from 'zustand';
import type { CartItem, CabinetKey, SideElements } from '@/lib/types';
import { cartApi } from '@/lib/api';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  hydrate: () => void;
  addItem: (cabinetKey: CabinetKey, sideElements: SideElements, price: number) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setOpen: (v: boolean) => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  hydrate: () => set({ items: cartApi.getItems() }),

  addItem: (cabinetKey, sideElements, price) => {
    const item = cartApi.addItem({ cabinetKey, sideElements, price, quantity: 1 });
    set({ items: [...get().items, item] });
  },

  updateQuantity: (id, qty) => {
    const items = cartApi.updateQuantity(id, qty);
    set({ items });
  },

  removeItem: (id) => {
    const items = cartApi.removeItem(id);
    set({ items });
  },

  clearCart: () => {
    cartApi.clear();
    set({ items: [] });
  },

  toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
  setOpen: (v) => set({ isOpen: v }),
  itemCount: () => get().items.reduce((n, i) => n + i.quantity, 0),
  subtotal: () => get().items.reduce((t, i) => t + i.price * i.quantity, 0),
}));
