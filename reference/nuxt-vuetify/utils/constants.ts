import type { CabinetKey, CabinetSpec, Side } from './types';

export const SIDES: Side[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export const CABINETS: Record<CabinetKey, CabinetSpec> = {
  compact:  { w: 600, h: 380, d: 210, base: 320, label: 'AE 1060 — Compact' },
  standard: { w: 760, h: 500, d: 300, base: 420, label: 'AE 1076 — Standard' },
  large:    { w: 1000, h: 600, d: 400, base: 580, label: 'AE 1114 — Large' },
  xlarge:   { w: 1200, h: 800, d: 500, base: 720, label: 'AE 1180 — X-Large' },
};

export const ELEMENT_PRICES: Record<string, number> = { hole: 12.50, rect: 18.00, opening: 25.00 };
export const ELEMENT_DEFAULTS: Record<string, { w: number; h: number; diameter?: number }> = {
  hole: { w: 36, h: 36, diameter: 22 },
  rect: { w: 80, h: 40 },
  opening: { w: 70, h: 30 },
};

export const SIDE_ROTATIONS: Record<Side, string> = {
  front: 'rotateX(-15deg) rotateY(-25deg)', back: 'rotateX(-15deg) rotateY(155deg)',
  left: 'rotateX(-15deg) rotateY(65deg)', right: 'rotateX(-15deg) rotateY(-65deg)',
  top: 'rotateX(-65deg) rotateY(-25deg)', bottom: 'rotateX(45deg) rotateY(-25deg)',
};

export const SNAP_GRID = 5;
export const MAX_UNDO = 50;

export function snap(v: number, grid = SNAP_GRID) { return Math.round(v / grid) * grid; }

export function getPanelDimensions(cab: CabinetKey, side: Side) {
  const c = CABINETS[cab];
  if (side === 'front' || side === 'back') return { pw: c.w, ph: c.h };
  if (side === 'left' || side === 'right') return { pw: c.d, ph: c.h };
  return { pw: c.w, ph: c.d };
}

export function calcPrice(cab: CabinetKey, se: Record<string, { type: string }[]>) {
  let t = CABINETS[cab].base;
  SIDES.forEach(s => (se[s] || []).forEach(el => { t += ELEMENT_PRICES[el.type] || 0; }));
  return t;
}

export function formatDimensions(cab: CabinetKey) {
  const c = CABINETS[cab]; return `${c.w} × ${c.h} × ${c.d} mm`;
}
