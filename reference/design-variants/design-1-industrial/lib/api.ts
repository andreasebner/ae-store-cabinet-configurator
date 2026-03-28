/**
 * API abstraction layer.
 *
 * Every function here is a thin wrapper around the eventual headless backend
 * (MedusaJS or similar). The current implementation uses localStorage so the
 * frontend can be built and tested completely offline. When the real backend
 * is wired up, only this file needs to change – all stores and UI remain the
 * same.
 */

import type {
  CartItem, Customer, Order, Address, OrderLineItem,
} from './types';

/* ─── helpers ─── */

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

/* ═══════════════════════════════════════
   CART
   ═══════════════════════════════════════ */

const CART_KEY = 'ycp_cart';

export const cartApi = {
  getItems(): CartItem[] {
    return read<CartItem[]>(CART_KEY, []);
  },

  addItem(item: Omit<CartItem, 'id' | 'addedAt'>): CartItem {
    const items = this.getItems();
    const newItem: CartItem = { ...item, id: uid(), addedAt: new Date().toISOString() };
    items.push(newItem);
    write(CART_KEY, items);
    return newItem;
  },

  updateQuantity(id: string, quantity: number): CartItem[] {
    const items = this.getItems().map(i =>
      i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
    );
    write(CART_KEY, items);
    return items;
  },

  removeItem(id: string): CartItem[] {
    const items = this.getItems().filter(i => i.id !== id);
    write(CART_KEY, items);
    return items;
  },

  clear(): void {
    write(CART_KEY, []);
  },
};

/* ═══════════════════════════════════════
   AUTH / CUSTOMER
   ═══════════════════════════════════════ */

const CUSTOMERS_KEY = 'ycp_customers';
const SESSION_KEY = 'ycp_session';

export const authApi = {
  /** Register a new customer (mock). */
  register(email: string, password: string, firstName: string, lastName: string): Customer {
    const customers = read<(Customer & { password: string })[]>(CUSTOMERS_KEY, []);
    if (customers.find(c => c.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const customer: Customer & { password: string } = {
      id: uid(), email, firstName, lastName, password,
      createdAt: new Date().toISOString(),
    };
    customers.push(customer);
    write(CUSTOMERS_KEY, customers);
    const { password: _, ...safe } = customer;
    write(SESSION_KEY, safe);
    return safe;
  },

  /** Log in (mock). */
  login(email: string, password: string): Customer {
    const customers = read<(Customer & { password: string })[]>(CUSTOMERS_KEY, []);
    const match = customers.find(c => c.email === email && c.password === password);
    if (!match) throw new Error('Invalid email or password.');
    const { password: _, ...safe } = match;
    write(SESSION_KEY, safe);
    return safe;
  },

  logout(): void {
    if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY);
  },

  getSession(): Customer | null {
    return read<Customer | null>(SESSION_KEY, null);
  },
};

/* ═══════════════════════════════════════
   ORDERS
   ═══════════════════════════════════════ */

const ORDERS_KEY = 'ycp_orders';

export const ordersApi = {
  getByCustomer(customerId: string): Order[] {
    return read<Order[]>(ORDERS_KEY, []).filter(o => o.customerId === customerId);
  },

  place(customerId: string, items: OrderLineItem[], shippingAddress: Address): Order {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.19 * 100) / 100; // 19 % VAT
    const order: Order = {
      id: uid(),
      customerId,
      items,
      shippingAddress,
      subtotal,
      tax,
      total: Math.round((subtotal + tax) * 100) / 100,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const all = read<Order[]>(ORDERS_KEY, []);
    all.push(order);
    write(ORDERS_KEY, all);
    return order;
  },
};
