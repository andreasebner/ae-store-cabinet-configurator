import type { Side, CabinetKey, CabinetSpec, SideElements } from './types';

export const SIDES: Side[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export const CABINETS: Record<CabinetKey, CabinetSpec> = {
  compact:    { name: 'Compact',    w: 400, h: 500, d: 200, basePrice: 320 },
  standard:   { name: 'Standard',   w: 600, h: 800, d: 300, basePrice: 480 },
  large:      { name: 'Large',      w: 800, h: 1200, d: 400, basePrice: 720 },
  industrial: { name: 'Industrial', w: 1000, h: 1600, d: 500, basePrice: 1100 },
};

export const ELEMENT_PRICES = { hole: 12.5, rect: 18, opening: 25 } as const;
export const ELEMENT_DEFAULTS = {
  hole: { w: 36, h: 36, diameter: 22 },
  rect: { w: 80, h: 40 },
  opening: { w: 120, h: 80 },
} as const;

export const SIDE_ROTATIONS: Record<Side, { x: number; y: number }> = {
  front:  { x: -15, y: -25 },
  back:   { x: -15, y: 155 },
  left:   { x: -15, y: 65 },
  right:  { x: -15, y: -65 },
  top:    { x: -75, y: 0 },
  bottom: { x: 75, y: 0 },
};

export const SNAP_GRID = 5;
export const MAX_UNDO = 50;

export function snap(v: number) { return Math.round(v / SNAP_GRID) * SNAP_GRID; }

export function getPanelDimensions(cab: CabinetKey, side: Side) {
  const c = CABINETS[cab];
  if (side === 'left' || side === 'right') return { w: c.d, h: c.h };
  if (side === 'top' || side === 'bottom') return { w: c.w, h: c.d };
  return { w: c.w, h: c.h };
}

export function formatDimensions(cab: CabinetKey, side: Side) {
  const d = getPanelDimensions(cab, side);
  return `${d.w} × ${d.h} mm`;
}

export function calcPrice(cab: CabinetKey, elements: SideElements) {
  let p = CABINETS[cab].basePrice;
  SIDES.forEach(s => elements[s].forEach(el => { p += ELEMENT_PRICES[el.type]; }));
  return p;
}
