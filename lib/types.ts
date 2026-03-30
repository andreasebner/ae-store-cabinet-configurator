export type Side = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type ElementType = 'hole' | 'rect' | 'custom' | 'text';
export type AnchorPoint = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
export type ToolType = 'move' | 'pan' | 'ruler' | ElementType;
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
  /** SVG path data for custom shapes (from DXF import) */
  pathData?: string;
  /** Original viewBox of the custom shape [minX, minY, width, height] */
  pathViewBox?: [number, number, number, number];
  /** Component catalog ID — fixed-size, no resize */
  componentId?: string;
  /** Text content for label elements */
  text?: string;
  /** Font size in mm for text labels */
  fontSize?: number;
}

export type SideElements = Record<Side, PanelElement[]>;

/* ─── Constraints ─── */

export type BorderRef = 'border-left' | 'border-right' | 'border-bottom';
export type ConstraintType = 'distance' | 'diameter';

export interface Constraint {
  id: number;
  constraintType: ConstraintType;
  /** Element or border that the distance is measured from (distance only) */
  fromRef: number | BorderRef;
  /** Target element */
  toRef: number;
  /** Axis of the distance measurement (distance only) */
  axis: 'x' | 'y';
  /** Constraint value in mm (distance or diameter) */
  value: number;
}

/** State for interactive constraint placement */
export interface ConstraintPlacement {
  type: ConstraintType;
  step: 'pick-from' | 'pick-to' | 'pick-element';
  fromRef?: number | BorderRef;
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
