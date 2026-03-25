export type Side = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type ElementType = 'hole' | 'rect' | 'opening';
export type ToolType = 'move' | ElementType;
export type CabinetKey = 'compact' | 'standard' | 'large' | 'industrial';

export interface CabinetSpec {
  name: string;
  w: number;
  h: number;
  d: number;
  basePrice: number;
  description: string;
}

export interface PanelElement {
  id: number;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  diameter?: number;
}

export type SideElements = Record<Side, PanelElement[]>;

/* ─── Cart / Auth / Orders ─── */

export interface CartItem {
  id: string;
  cabinetKey: CabinetKey;
  sideElements: SideElements;
  price: number;
  quantity: number;
  addedAt: string; // ISO date
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLineItem {
  cabinetKey: CabinetKey;
  sideElements: SideElements;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderLineItem[];
  shippingAddress: Address;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}
