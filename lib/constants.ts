import type { Side, CabinetKey, CabinetSpec, SideElements, AlignmentElement } from './types';

export const SIDES: Side[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

export const CABINETS: Record<CabinetKey, CabinetSpec> = {
  compact: {
    name: 'AE 1060 — Compact',
    w: 600, h: 380, d: 210,
    basePrice: 320,
    description: 'Ideal for small installations with limited wall space. IP66 rated.',
  },
  standard: {
    name: 'AE 1076 — Standard',
    w: 760, h: 500, d: 300,
    basePrice: 480,
    description: 'The go-to enclosure for most industrial control applications.',
  },
  large: {
    name: 'AE 1114 — Large',
    w: 1000, h: 600, d: 400,
    basePrice: 720,
    description: 'Extra room for complex configurations with multiple DIN rails.',
  },
  industrial: {
    name: 'AE 1180 — Industrial',
    w: 1200, h: 800, d: 500,
    basePrice: 1100,
    description: 'Heavy-duty enclosure for demanding industrial environments.',
  },
};

export const CABINET_KEYS = Object.keys(CABINETS) as CabinetKey[];

export const ELEMENT_PRICES: Record<string, number> = {
  hole: 12.50,
  rect: 18.00,
  opening: 25.00,
};

export const ELEMENT_DEFAULTS: Record<string, { w: number; h: number; diameter?: number }> = {
  hole: { w: 36, h: 36, diameter: 22 },
  rect: { w: 80, h: 40 },
  opening: { w: 70, h: 30 },
};

export const SNAP_GRID = 5;
export const MAX_UNDO = 50;

export function snap(v: number): number {
  return Math.round(v / SNAP_GRID) * SNAP_GRID;
}

export function getPanelDimensions(cabinet: CabinetKey, side: Side) {
  const c = CABINETS[cabinet];
  if (side === 'front' || side === 'back') return { pw: c.w, ph: c.h };
  if (side === 'left' || side === 'right') return { pw: c.d, ph: c.h };
  return { pw: c.w, ph: c.d };
}

export function calcPrice(cabinet: CabinetKey, sideElements: SideElements): number {
  let total = CABINETS[cabinet].basePrice;
  SIDES.forEach(s => {
    (sideElements[s] || []).forEach(el => {
      total += ELEMENT_PRICES[el.type] || 0;
    });
  });
  return total;
}

export const SNAP_THRESHOLD = 8; // mm — snap distance for alignment points

export function getAlignSnapPoints(a: AlignmentElement): { x: number; y: number }[] {
  if (a.type === 'align-circular') {
    return Array.from({ length: a.count }, (_, i) => {
      const angle = (2 * Math.PI * i) / a.count - Math.PI / 2;
      return { x: a.x + (a.diameter / 2) * Math.cos(angle), y: a.y + (a.diameter / 2) * Math.sin(angle) };
    });
  }
  const points: { x: number; y: number }[] = [];
  const gw = (a.cols - 1) * a.spacingX;
  const gh = (a.rows - 1) * a.spacingY;
  for (let r = 0; r < a.rows; r++) {
    for (let c = 0; c < a.cols; c++) {
      points.push({ x: a.x - gw / 2 + c * a.spacingX, y: a.y - gh / 2 + r * a.spacingY });
    }
  }
  return points;
}

export function formatDimensions(cabinet: CabinetKey): string {
  const c = CABINETS[cabinet];
  return `${c.w} × ${c.h} × ${c.d} mm`;
}

export const SIDE_ROTATIONS: Record<Side, { x: number; y: number }> = {
  front:  { x: -15, y: -25 },
  back:   { x: -15, y: 155 },
  left:   { x: -15, y: 65 },
  right:  { x: -15, y: -65 },
  top:    { x: -75, y: 0 },
  bottom: { x: 75, y: 0 },
};
