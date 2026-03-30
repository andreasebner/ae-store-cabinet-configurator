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
  custom: 35.00,
  text: 0,
};

export const ELEMENT_DEFAULTS: Record<string, { w: number; h: number; diameter?: number }> = {
  hole: { w: 36, h: 36, diameter: 22 },
  rect: { w: 80, h: 40 },
  text: { w: 60, h: 16 },
};

/* ─── Predefined Shapes ─── */

export interface ShapeDef {
  id: string;
  label: string;
  /** Bounding box width in mm */
  w: number;
  /** Bounding box height in mm */
  h: number;
  /** SVG path data */
  pathData: string;
  /** SVG viewBox [minX, minY, width, height] */
  viewBox: [number, number, number, number];
  price: number;
  description?: string;
}

export const SHAPE_CATALOG: ShapeDef[] = [
  {
    id: 'fan-80mm',
    label: 'Fan Inlet 80mm',
    w: 80, h: 80,
    pathData: [
      // Outer circle (fan opening)
      'M 40,4 A 36,36 0 1,1 40,76 A 36,36 0 1,1 40,4 Z',
      // Four mounting holes (3.5mm radius) at corners
      'M 11,11 m -3.5,0 a 3.5,3.5 0 1,0 7,0 a 3.5,3.5 0 1,0 -7,0',
      'M 69,11 m -3.5,0 a 3.5,3.5 0 1,0 7,0 a 3.5,3.5 0 1,0 -7,0',
      'M 11,69 m -3.5,0 a 3.5,3.5 0 1,0 7,0 a 3.5,3.5 0 1,0 -7,0',
      'M 69,69 m -3.5,0 a 3.5,3.5 0 1,0 7,0 a 3.5,3.5 0 1,0 -7,0',
    ].join(' '),
    viewBox: [0, 0, 80, 80],
    price: 15.00,
    description: '80×80mm fan cutout with 4 mounting holes (71.5mm spacing)',
  },
  {
    id: 'fan-120mm',
    label: 'Fan Inlet 120mm',
    w: 120, h: 120,
    pathData: [
      // Outer circle (fan opening)
      'M 60,6 A 54,54 0 1,1 60,114 A 54,54 0 1,1 60,6 Z',
      // Four mounting holes (4mm radius) at corners
      'M 13,13 m -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0',
      'M 107,13 m -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0',
      'M 13,107 m -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0',
      'M 107,107 m -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0',
    ].join(' '),
    viewBox: [0, 0, 120, 120],
    price: 20.00,
    description: '120×120mm fan cutout with 4 mounting holes (105mm spacing)',
  },
];

/* ─── Component Catalog ─── */

export interface ComponentDef {
  id: string;
  category: string;
  label: string;
  /** Fixed width in mm */
  w: number;
  /** Fixed height in mm */
  h: number;
  /** Cutout diameter for round connectors (mm) */
  cutoutDiameter?: number;
  /** Shape type for 2D rendering */
  shape: 'circle' | 'rect';
  price: number;
  description?: string;
}

function connectorDefs(series: 'M8' | 'M12'): ComponentDef[] {
  const d = series === 'M8' ? 12 : 16; // cutout diameter mm
  const sz = series === 'M8' ? 18 : 22; // bounding box mm
  const basePrice = series === 'M8' ? 8.50 : 12.00;
  const defs: ComponentDef[] = [];
  for (let pins = 2; pins <= 5; pins++) {
    defs.push({
      id: `${series.toLowerCase()}-${pins}pin`,
      category: series,
      label: `${series} ${pins}-pin`,
      w: sz, h: sz,
      cutoutDiameter: d,
      shape: 'circle',
      price: basePrice + (pins - 2) * 1.50,
    });
    defs.push({
      id: `${series.toLowerCase()}-${pins}pin-cable`,
      category: series,
      label: `${series} ${pins}-pin + 30cm cable`,
      w: sz, h: sz,
      cutoutDiameter: d,
      shape: 'circle',
      price: basePrice + (pins - 2) * 1.50 + 4.00,
      description: 'Includes 30cm pre-wired cable',
    });
  }
  return defs;
}

export const COMPONENT_CATALOG: ComponentDef[] = [
  ...connectorDefs('M8'),
  ...connectorDefs('M12'),
  {
    id: 'iec-c14',
    category: 'Power',
    label: 'Kaltgerätestecker (IEC C14)',
    w: 30, h: 24,
    shape: 'rect',
    price: 6.50,
    description: 'Standard IEC 60320 C14 inlet',
  },
];

export const COMPONENT_MAP: Record<string, ComponentDef> = Object.fromEntries(
  COMPONENT_CATALOG.map(c => [c.id, c])
);

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
      const comp = (el as any).componentId ? COMPONENT_MAP[(el as any).componentId] : null;
      total += comp ? comp.price : (ELEMENT_PRICES[el.type] || 0);
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
