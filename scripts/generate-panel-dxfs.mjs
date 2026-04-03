#!/usr/bin/env node
/**
 * Generate sample panel outline DXF files for all cabinet types.
 * Run with: node scripts/generate-panel-dxfs.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';

const CABINETS = {
  compact:    { w: 600,  h: 380, d: 210 },
  standard:   { w: 760,  h: 500, d: 300 },
  large:      { w: 1000, h: 600, d: 400 },
  industrial: { w: 1200, h: 800, d: 500 },
};

const SIDES_DIMS = (c) => ({
  front:  { pw: c.w, ph: c.h },
  back:   { pw: c.w, ph: c.h },
  left:   { pw: c.d, ph: c.h },
  right:  { pw: c.d, ph: c.h },
  top:    { pw: c.w, ph: c.d },
  bottom: { pw: c.w, ph: c.d },
});

const CFG = { cornerRadius: 10, margin: 12, crossBarWidth: 15 };
const BULGE = Math.tan(Math.PI / 8);
const f = (n) => Number(n.toFixed(4)).toString();

function pushRoundedRect(lines, handle, layer, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  if (r < 0.5) {
    pushRect(lines, handle, layer, x, y, w, h);
    return;
  }
  const pts = [
    { x: x + r, y: y, b: 0 },
    { x: x + w - r, y: y, b: BULGE },
    { x: x + w, y: y + r, b: 0 },
    { x: x + w, y: y + h - r, b: BULGE },
    { x: x + w - r, y: y + h, b: 0 },
    { x: x + r, y: y + h, b: BULGE },
    { x: x, y: y + h - r, b: 0 },
    { x: x, y: y + r, b: BULGE },
  ];
  lines.push('0', 'LWPOLYLINE', '5', handle, '8', layer);
  lines.push('90', String(pts.length), '70', '1');
  for (const p of pts) {
    lines.push('10', f(p.x), '20', f(p.y));
    if (Math.abs(p.b) > 1e-6) lines.push('42', f(p.b));
  }
}

function pushRect(lines, handle, layer, x, y, w, h) {
  lines.push('0', 'LWPOLYLINE', '5', handle, '8', layer);
  lines.push('90', '4', '70', '1');
  lines.push('10', f(x), '20', f(y));
  lines.push('10', f(x + w), '20', f(y));
  lines.push('10', f(x + w), '20', f(y + h));
  lines.push('10', f(x), '20', f(y + h));
}

function generateDxf(pw, ph) {
  const { cornerRadius: r, margin: m, crossBarWidth: bw } = CFG;
  const lines = [];
  let hc = 100;
  const h = () => (hc++).toString(16).toUpperCase();

  // Header
  lines.push('0', 'SECTION', '2', 'HEADER');
  lines.push('9', '$ACADVER', '1', 'AC1015');
  lines.push('9', '$INSUNITS', '70', '4');
  lines.push('9', '$MEASUREMENT', '70', '1');
  lines.push('9', '$LUNITS', '70', '2');
  lines.push('9', '$EXTMIN', '10', '0.0', '20', '0.0', '30', '0.0');
  lines.push('9', '$EXTMAX', '10', f(pw), '20', f(ph), '30', '0.0');
  lines.push('0', 'ENDSEC');

  // Layer table
  lines.push('0', 'SECTION', '2', 'TABLES');
  lines.push('0', 'TABLE', '2', 'LAYER', '70', '3');
  for (const [name, color] of [['BOUNDARY', '7'], ['CUTTABLE', '3'], ['EXCLUSION', '1']]) {
    lines.push('0', 'LAYER', '5', h(), '100', 'AcDbSymbolTableRecord', '100', 'AcDbLayerTableRecord');
    lines.push('2', name, '70', '0', '62', color, '6', 'Continuous');
  }
  lines.push('0', 'ENDTAB');
  lines.push('0', 'ENDSEC');

  // Entities
  lines.push('0', 'SECTION', '2', 'ENTITIES');
  pushRoundedRect(lines, h(), 'BOUNDARY', 0, 0, pw, ph, r);
  const innerR = Math.max(0.5, r - m);
  pushRoundedRect(lines, h(), 'CUTTABLE', m, m, pw - 2 * m, ph - 2 * m, innerR);
  const cx = pw / 2, cy = ph / 2, hw = bw / 2;
  pushRect(lines, h(), 'EXCLUSION', cx - hw, 0, bw, ph);
  pushRect(lines, h(), 'EXCLUSION', 0, cy - hw, pw, bw);
  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');
  return lines.join('\n');
}

// Generate DXF files
let count = 0;
for (const [key, cab] of Object.entries(CABINETS)) {
  const sides = SIDES_DIMS(cab);
  // Generate all six sides
  for (const [side, dims] of Object.entries(sides)) {
    const dir = `public/assets/cabinets/${key}`;
    mkdirSync(dir, { recursive: true });
    const path = `${dir}/panel-${side}.dxf`;
    writeFileSync(path, generateDxf(dims.pw, dims.ph));
    count++;
  }
}
console.log(`Generated ${count} panel outline DXF files.`);
