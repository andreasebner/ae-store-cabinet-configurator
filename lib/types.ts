export type Side = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type ElementType = 'hole' | 'rect' | 'opening';
export type AnchorPoint = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
export type ToolType = 'move' | 'ruler' | ElementType;
export type CabinetKey = 'compact' | 'standard' | 'large' | 'industrial';

export interface AlignmentElement {
  id: number;
  type: 'align-circular' | 'align-rectangular';
  x: number;
  y: number;
  diameter: number;
  count: number;
  rows: number;
  cols: number;
  spacingX: number;
  spacingY: number;
}

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
  anchor?: AnchorPoint;
  radius?: number;
}

export type SideElements = Record<Side, PanelElement[]>;

/* ─── Constraints ─── */

export type BorderRef = 'border-left' | 'border-right' | 'border-bottom';

export interface Constraint {
  id: number;
  /** Element or border that the distance is measured from */
  fromRef: number | BorderRef;
  /** Element that the distance is measured to */
  toRef: number;
  /** Axis of the distance measurement */
  axis: 'x' | 'y';
  /** Target distance in mm */
  value: number;
}

export type SideConstraints = Record<Side, Constraint[]>;

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
