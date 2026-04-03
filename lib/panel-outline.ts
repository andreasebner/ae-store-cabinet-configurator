/**
 * Panel outline system — defines the cuttable area for each panel side.
 *
 * Each panel has:
 * - A boundary (outer panel shape — typically a rounded rectangle)
 * - A cuttable area (boundary minus edge keepout margin)
 * - Exclusion zones (structural supports that can't be cut through)
 *
 * SVG paths use the editor's coordinate system (Y-down, origin top-left, mm).
 * DXF output uses standard DXF coordinates (Y-up, origin bottom-left, mm).
 */

export interface PanelOutlineConfig {
  /** Outer boundary corner radius in mm */
  cornerRadius: number;
  /** Edge keepout margin in mm — elements can't be placed within this distance of the panel edge */
  margin: number;
  /** Width of structural cross bars in mm */
  crossBarWidth: number;
  /** Include horizontal cross bar */
  hasCrossH: boolean;
  /** Include vertical cross bar */
  hasCrossV: boolean;
}

export interface PanelOutline {
  /** SVG path for the outer panel boundary */
  boundaryPath: string;
  /** SVG path for the cuttable area (inset from boundary by margin) */
  cuttablePath: string;
  /** SVG path(s) for exclusion zones (cross bars, structural supports) */
  exclusionPaths: string[];
  /** Compound SVG path for non-cuttable overlay (use with fill-rule="evenodd") */
  overlayPath: string;
  /** The config used to generate this outline */
  config: PanelOutlineConfig;
}

export const DEFAULT_OUTLINE_CONFIG: PanelOutlineConfig = {
  cornerRadius: 10,
  margin: 12,
  crossBarWidth: 15,
  hasCrossH: true,
  hasCrossV: true,
};

/* ─── SVG path helpers (Y-down editor coords) ─── */

function roundedRectSvg(x: number, y: number, w: number, h: number, r: number): string {
  r = Math.min(r, w / 2, h / 2);
  if (r < 0.5) return `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z`;
  return [
    `M ${x + r},${y}`,
    `H ${x + w - r}`,
    `A ${r},${r} 0 0 1 ${x + w},${y + r}`,
    `V ${y + h - r}`,
    `A ${r},${r} 0 0 1 ${x + w - r},${y + h}`,
    `H ${x + r}`,
    `A ${r},${r} 0 0 1 ${x},${y + h - r}`,
    `V ${y + r}`,
    `A ${r},${r} 0 0 1 ${x + r},${y}`,
    'Z',
  ].join(' ');
}

function rectSvg(x: number, y: number, w: number, h: number): string {
  return `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z`;
}

/**
 * Generate panel outline paths for the given panel dimensions.
 */
export function generatePanelOutline(
  pw: number,
  ph: number,
  config?: Partial<PanelOutlineConfig>,
): PanelOutline {
  const cfg = { ...DEFAULT_OUTLINE_CONFIG, ...config };
  const { cornerRadius: r, margin: m, crossBarWidth: bw, hasCrossH, hasCrossV } = cfg;

  const boundaryPath = roundedRectSvg(0, 0, pw, ph, r);

  const innerR = Math.max(0, r - m);
  const cuttablePath = roundedRectSvg(m, m, pw - 2 * m, ph - 2 * m, innerR);

  const exclusionPaths: string[] = [];
  const cx = pw / 2;
  const cy = ph / 2;
  const hw = bw / 2;

  if (hasCrossH && hasCrossV) {
    // Combined cross shape as a single closed path (avoids overlap issues with evenodd)
    exclusionPaths.push([
      `M ${cx - hw},${m}`,
      `V ${cy - hw}`,
      `H ${m}`,
      `V ${cy + hw}`,
      `H ${cx - hw}`,
      `V ${ph - m}`,
      `H ${cx + hw}`,
      `V ${cy + hw}`,
      `H ${pw - m}`,
      `V ${cy - hw}`,
      `H ${cx + hw}`,
      `V ${m}`,
      'Z',
    ].join(' '));
  } else if (hasCrossV) {
    exclusionPaths.push(rectSvg(cx - hw, m, bw, ph - 2 * m));
  } else if (hasCrossH) {
    exclusionPaths.push(rectSvg(m, cy - hw, pw - 2 * m, bw));
  }

  // Build compound overlay path for fill-rule="evenodd" rendering.
  // The panel rect fills everything, the cuttable area carves a hole,
  // and exclusion zones fill back in.
  const panelRect = `M 0,0 H ${pw} V ${ph} H 0 Z`;
  const overlayPath = [panelRect, cuttablePath, ...exclusionPaths].join(' ');

  return { boundaryPath, cuttablePath, exclusionPaths, overlayPath, config: cfg };
}

/* ─── DXF generation (Y-up standard DXF coords) ─── */

const fmt = (n: number) => Number(n.toFixed(4)).toString();
const BULGE_90 = Math.tan(Math.PI / 8); // ≈ 0.4142 for 90° quarter-circle

function pushRoundedRectDxf(
  lines: string[], handle: string, layer: string,
  x: number, y: number, w: number, h: number, r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  if (r < 0.5) {
    pushRectDxf(lines, handle, layer, x, y, w, h);
    return;
  }
  const pts = [
    { x: x + r, y: y, b: 0 },
    { x: x + w - r, y: y, b: BULGE_90 },
    { x: x + w, y: y + r, b: 0 },
    { x: x + w, y: y + h - r, b: BULGE_90 },
    { x: x + w - r, y: y + h, b: 0 },
    { x: x + r, y: y + h, b: BULGE_90 },
    { x: x, y: y + h - r, b: 0 },
    { x: x, y: y + r, b: BULGE_90 },
  ];
  lines.push('0', 'LWPOLYLINE', '5', handle, '8', layer);
  lines.push('90', String(pts.length), '70', '1');
  for (const p of pts) {
    lines.push('10', fmt(p.x), '20', fmt(p.y));
    if (Math.abs(p.b) > 1e-6) lines.push('42', fmt(p.b));
  }
}

function pushRectDxf(
  lines: string[], handle: string, layer: string,
  x: number, y: number, w: number, h: number,
) {
  lines.push('0', 'LWPOLYLINE', '5', handle, '8', layer);
  lines.push('90', '4', '70', '1');
  lines.push('10', fmt(x), '20', fmt(y));
  lines.push('10', fmt(x + w), '20', fmt(y));
  lines.push('10', fmt(x + w), '20', fmt(y + h));
  lines.push('10', fmt(x), '20', fmt(y + h));
}

/**
 * Generate a DXF file representing the panel outline.
 * Layers: BOUNDARY (outer edge), CUTTABLE (inner usable area), EXCLUSION (cross bars).
 */
export function generateOutlineDxf(
  pw: number,
  ph: number,
  config?: Partial<PanelOutlineConfig>,
): string {
  const cfg = { ...DEFAULT_OUTLINE_CONFIG, ...config };
  const { cornerRadius: r, margin: m, crossBarWidth: bw, hasCrossH, hasCrossV } = cfg;
  const lines: string[] = [];
  let hc = 100;
  const h = () => (hc++).toString(16).toUpperCase();

  // Header
  lines.push('0', 'SECTION', '2', 'HEADER');
  lines.push('9', '$ACADVER', '1', 'AC1015');
  lines.push('9', '$INSUNITS', '70', '4');
  lines.push('9', '$MEASUREMENT', '70', '1');
  lines.push('9', '$LUNITS', '70', '2');
  lines.push('9', '$EXTMIN', '10', '0.0', '20', '0.0', '30', '0.0');
  lines.push('9', '$EXTMAX', '10', fmt(pw), '20', fmt(ph), '30', '0.0');
  lines.push('0', 'ENDSEC');

  // Layer table
  lines.push('0', 'SECTION', '2', 'TABLES');
  lines.push('0', 'TABLE', '2', 'LAYER', '70', '3');
  for (const [name, color] of [['BOUNDARY', '7'], ['CUTTABLE', '3'], ['EXCLUSION', '1']] as const) {
    lines.push('0', 'LAYER', '5', h(), '100', 'AcDbSymbolTableRecord', '100', 'AcDbLayerTableRecord');
    lines.push('2', name, '70', '0', '62', color, '6', 'Continuous');
  }
  lines.push('0', 'ENDTAB');
  lines.push('0', 'ENDSEC');

  // Entities
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  // Boundary — outer panel shape
  pushRoundedRectDxf(lines, h(), 'BOUNDARY', 0, 0, pw, ph, r);

  // Cuttable area — inset by margin
  const innerR = Math.max(0.5, r - m);
  pushRoundedRectDxf(lines, h(), 'CUTTABLE', m, m, pw - 2 * m, ph - 2 * m, innerR);

  // Exclusion zones — cross bars
  const cx = pw / 2;
  const cy = ph / 2;
  const hw = bw / 2;
  if (hasCrossV) {
    pushRectDxf(lines, h(), 'EXCLUSION', cx - hw, 0, bw, ph);
  }
  if (hasCrossH) {
    pushRectDxf(lines, h(), 'EXCLUSION', 0, cy - hw, pw, bw);
  }

  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');
  return lines.join('\n');
}
