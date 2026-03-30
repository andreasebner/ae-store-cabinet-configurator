/**
 * Export the current 2D panel (all elements on the current side) as a DXF file,
 * and import a DXF file back into elements.
 *
 * DXF conventions used:
 * - Panel outline is drawn as a LWPOLYLINE on layer "PANEL"
 * - Holes are CIRCLE entities on layer "HOLES"
 * - Rects are LWPOLYLINE rectangles on layer "RECTS"
 * - Custom shapes are LWPOLYLINE approximations on layer "CUSTOM"
 * - Text labels are TEXT entities on layer "TEXT"
 *
 * All coordinates are in mm with origin at top-left (DXF Y is flipped on export).
 */

import type { PanelElement, ElementType, AnchorPoint } from './types';
import DxfParser from 'dxf-parser';

/* ─────────────────────── EXPORT ─────────────────────── */

export function exportPanelDxf(
  elements: PanelElement[],
  panelWidth: number,
  panelHeight: number,
): string {
  const lines: string[] = [];
  let handleCounter = 100;
  const h = () => (handleCounter++).toString(16).toUpperCase();

  // ── Header ──
  lines.push('0', 'SECTION', '2', 'HEADER');
  lines.push('9', '$ACADVER', '1', 'AC1015');
  lines.push('9', '$INSUNITS', '70', '4'); // mm
  lines.push('9', '$MEASUREMENT', '70', '1'); // metric
  lines.push('9', '$LUNITS', '70', '2'); // decimal
  lines.push('9', '$EXTMIN', '10', '0.0', '20', '0.0', '30', '0.0');
  lines.push('9', '$EXTMAX', '10', fmt(panelWidth), '20', fmt(panelHeight), '30', '0.0');
  lines.push('0', 'ENDSEC');

  // ── Tables (layers) ──
  lines.push('0', 'SECTION', '2', 'TABLES');
  lines.push('0', 'TABLE', '2', 'LAYER', '70', '5');
  const layers = [
    { name: 'PANEL', color: 7 },
    { name: 'HOLES', color: 1 },
    { name: 'RECTS', color: 5 },
    { name: 'CUSTOM', color: 6 },
    { name: 'TEXT', color: 3 },
  ];
  for (const layer of layers) {
    lines.push('0', 'LAYER', '5', h(), '100', 'AcDbSymbolTableRecord', '100', 'AcDbLayerTableRecord');
    lines.push('2', layer.name, '70', '0', '62', String(layer.color), '6', 'Continuous');
  }
  lines.push('0', 'ENDTAB');
  lines.push('0', 'ENDSEC');

  // ── Entities ──
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  // Panel outline (rectangle from 0,0 to pw,ph — Y flipped: 0,0 → 0,ph in DXF)
  pushLwPolyline(lines, h(), 'PANEL', [
    [0, panelHeight],
    [panelWidth, panelHeight],
    [panelWidth, 0],
    [0, 0],
  ], true);

  for (const el of elements) {
    // Flip Y: DXF Y-up, our editor Y-down.  dxfY = panelHeight - editorY
    const dy = (y: number) => panelHeight - y;

    switch (el.type) {
      case 'hole': {
        const cx = el.x + el.w / 2;
        const cy = el.y + el.h / 2;
        const r = (el.diameter ?? el.w) / 2;
        pushCircle(lines, h(), 'HOLES', cx, dy(cy), r);
        break;
      }
      case 'rect': {
        const r = el.radius ?? 3;
        if (r > 0.5) {
          pushRoundedRect(lines, h(), 'RECTS', el.x, dy(el.y + el.h), el.w, el.h, r);
        } else {
          pushLwPolyline(lines, h(), 'RECTS', [
            [el.x, dy(el.y + el.h)],
            [el.x + el.w, dy(el.y + el.h)],
            [el.x + el.w, dy(el.y)],
            [el.x, dy(el.y)],
          ], true);
        }
        break;
      }
      case 'text': {
        const text = el.text || 'Label';
        const fontSize = el.fontSize ?? 10;
        // Insert at bottom-left of the text box in DXF coords
        pushText(lines, h(), 'TEXT', el.x, dy(el.y + el.h), fontSize, text);
        break;
      }
      case 'custom': {
        // For custom shapes, export the bounding rect as a placeholder
        pushLwPolyline(lines, h(), 'CUSTOM', [
          [el.x, dy(el.y + el.h)],
          [el.x + el.w, dy(el.y + el.h)],
          [el.x + el.w, dy(el.y)],
          [el.x, dy(el.y)],
        ], true);
        break;
      }
    }
  }

  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');
  return lines.join('\n');
}

/* ─── DXF entity helpers ─── */

function pushCircle(lines: string[], handle: string, layer: string, cx: number, cy: number, r: number) {
  lines.push('0', 'CIRCLE', '5', handle, '8', layer);
  lines.push('10', fmt(cx), '20', fmt(cy), '30', '0.0');
  lines.push('40', fmt(r));
}

function pushLwPolyline(lines: string[], handle: string, layer: string, pts: number[][], closed: boolean) {
  lines.push('0', 'LWPOLYLINE', '5', handle, '8', layer);
  lines.push('90', String(pts.length));
  lines.push('70', closed ? '1' : '0');
  for (const [x, y] of pts) {
    lines.push('10', fmt(x), '20', fmt(y));
  }
}

function pushRoundedRect(lines: string[], handle: string, layer: string, x: number, y: number, w: number, h: number, r: number) {
  // Clamp radius
  r = Math.min(r, w / 2, h / 2);
  const bulge = Math.tan(Math.PI / 8); // 45° arc quarter-circle bulge
  // Vertices go counter-clockwise from bottom-left, with bulge at corners
  const pts: { x: number; y: number; bulge: number }[] = [
    { x: x + r, y: y, bulge: 0 },           // bottom edge start
    { x: x + w - r, y: y, bulge: bulge },    // bottom-right corner start
    { x: x + w, y: y + r, bulge: 0 },        // right edge start
    { x: x + w, y: y + h - r, bulge: bulge },// top-right corner start
    { x: x + w - r, y: y + h, bulge: 0 },    // top edge start
    { x: x + r, y: y + h, bulge: bulge },    // top-left corner start
    { x: x, y: y + h - r, bulge: 0 },        // left edge start
    { x: x, y: y + r, bulge: bulge },        // bottom-left corner start
  ];
  lines.push('0', 'LWPOLYLINE', '5', handle, '8', layer);
  lines.push('90', String(pts.length));
  lines.push('70', '1'); // closed
  for (const p of pts) {
    lines.push('10', fmt(p.x), '20', fmt(p.y));
    if (Math.abs(p.bulge) > 1e-6) {
      lines.push('42', fmt(p.bulge));
    }
  }
}

function pushText(lines: string[], handle: string, layer: string, x: number, y: number, height: number, text: string) {
  lines.push('0', 'TEXT', '5', handle, '8', layer);
  lines.push('10', fmt(x), '20', fmt(y), '30', '0.0');
  lines.push('40', fmt(height));
  lines.push('1', text);
}

function fmt(n: number): string {
  return Number(n.toFixed(4)).toString();
}

/* ─────────────────────── IMPORT ─────────────────────── */

/**
 * Parse a DXF file that represents a full panel layout.
 * Returns the detected panel dimensions and all elements.
 */
export function importPanelDxf(dxfString: string): {
  panelWidth: number;
  panelHeight: number;
  elements: Omit<PanelElement, 'id'>[];
} {
  const parser = new DxfParser();
  const dxf = parser.parseSync(dxfString);
  if (!dxf || !dxf.entities || dxf.entities.length === 0) {
    throw new Error('No entities found in DXF file');
  }

  // Separate entities by layer
  const panelEntities: any[] = [];
  const holeEntities: any[] = [];
  const rectEntities: any[] = [];
  const textEntities: any[] = [];
  const customEntities: any[] = [];
  const otherEntities: any[] = [];

  for (const entity of dxf.entities) {
    const layer = ((entity as any).layer || '').toUpperCase();
    if (layer === 'PANEL') panelEntities.push(entity);
    else if (layer === 'HOLES') holeEntities.push(entity);
    else if (layer === 'RECTS') rectEntities.push(entity);
    else if (layer === 'TEXT') textEntities.push(entity);
    else if (layer === 'CUSTOM') customEntities.push(entity);
    else otherEntities.push(entity);
  }

  // Detect panel dimensions from PANEL layer or overall bounding box
  let panelWidth = 0;
  let panelHeight = 0;

  if (panelEntities.length > 0) {
    const bb = entityBounds(panelEntities);
    panelWidth = bb.maxX - bb.minX;
    panelHeight = bb.maxY - bb.minY;
  } else {
    // Fall back to bounding box of all entities
    const bb = entityBounds(dxf.entities as any[]);
    panelWidth = bb.maxX - bb.minX;
    panelHeight = bb.maxY - bb.minY;
  }

  if (panelWidth <= 0 || panelHeight <= 0) {
    throw new Error('Could not determine panel dimensions from DXF');
  }

  const elements: Omit<PanelElement, 'id'>[] = [];
  // Flip Y: DXF Y-up → editor Y-down.  editorY = panelHeight - dxfY
  const ey = (dxfY: number) => panelHeight - dxfY;

  // ── Holes (CIRCLE entities) ──
  for (const e of holeEntities) {
    if (e.type === 'CIRCLE') {
      const cx: number = e.center.x;
      const cy: number = e.center.y;
      const r: number = e.radius;
      const diameter = Math.round(r * 2);
      const w = diameter;
      elements.push({
        type: 'hole',
        x: Math.round(cx - w / 2),
        y: Math.round(ey(cy) - w / 2),
        w, h: w,
        diameter,
      });
    }
  }

  // ── Rects (LWPOLYLINE / POLYLINE) ──
  for (const e of rectEntities) {
    if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
      const verts: { x: number; y: number }[] = e.vertices || [];
      if (verts.length < 3) continue;
      const bb = vertsBounds(verts);
      const w = Math.round(bb.maxX - bb.minX);
      const h = Math.round(bb.maxY - bb.minY);
      if (w < 1 || h < 1) continue;
      elements.push({
        type: 'rect',
        x: Math.round(bb.minX),
        y: Math.round(ey(bb.maxY)),
        w, h,
        anchor: 'center' as AnchorPoint,
        radius: 3,
      });
    }
  }

  // ── Text (TEXT entities) ──
  for (const e of textEntities) {
    if (e.type === 'TEXT') {
      const x: number = e.startPoint?.x ?? e.position?.x ?? 0;
      const y: number = e.startPoint?.y ?? e.position?.y ?? 0;
      const height: number = e.textHeight || e.height || 10;
      const text: string = e.text || 'Label';
      // Estimate text width: ~0.6 × height × character count
      const estW = Math.max(20, Math.round(height * 0.6 * text.length));
      const estH = Math.round(height * 1.4);
      elements.push({
        type: 'text',
        x: Math.round(x),
        y: Math.round(ey(y) - estH),
        w: estW,
        h: estH,
        text,
        fontSize: Math.round(height),
        anchor: 'bottom-left' as AnchorPoint,
      });
    }
  }

  // ── Custom shapes (as rects for now) ──
  for (const e of customEntities) {
    if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
      const verts: { x: number; y: number }[] = e.vertices || [];
      if (verts.length < 3) continue;
      const bb = vertsBounds(verts);
      const w = Math.round(bb.maxX - bb.minX);
      const h = Math.round(bb.maxY - bb.minY);
      if (w < 1 || h < 1) continue;
      elements.push({
        type: 'rect',
        x: Math.round(bb.minX),
        y: Math.round(ey(bb.maxY)),
        w, h,
        anchor: 'center' as AnchorPoint,
        radius: 3,
      });
    }
  }

  // ── Unlayered entities: auto-detect by type ──
  // Only process if no layered entities were found (generic DXF file)
  if (holeEntities.length === 0 && rectEntities.length === 0 && textEntities.length === 0) {
    for (const e of otherEntities) {
      if (e.type === 'CIRCLE') {
        const cx: number = e.center.x;
        const cy: number = e.center.y;
        const r: number = e.radius;
        const diameter = Math.round(r * 2);
        const w = diameter;
        elements.push({
          type: 'hole',
          x: Math.round(cx - w / 2),
          y: Math.round(ey(cy) - w / 2),
          w, h: w,
          diameter,
        });
      } else if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
        const verts: { x: number; y: number }[] = e.vertices || [];
        if (verts.length < 3) continue;
        const bb = vertsBounds(verts);
        const w = Math.round(bb.maxX - bb.minX);
        const h = Math.round(bb.maxY - bb.minY);
        if (w < 1 || h < 1) continue;
        // Skip if same size as panel (it's the outline)
        if (Math.abs(w - panelWidth) < 2 && Math.abs(h - panelHeight) < 2) continue;
        elements.push({
          type: 'rect',
          x: Math.round(bb.minX),
          y: Math.round(ey(bb.maxY)),
          w, h,
          anchor: 'center' as AnchorPoint,
          radius: 3,
        });
      } else if (e.type === 'TEXT') {
        const x: number = e.startPoint?.x ?? e.position?.x ?? 0;
        const y: number = e.startPoint?.y ?? e.position?.y ?? 0;
        const height: number = e.textHeight || e.height || 10;
        const text: string = e.text || 'Label';
        const estW = Math.max(20, Math.round(height * 0.6 * text.length));
        const estH = Math.round(height * 1.4);
        elements.push({
          type: 'text',
          x: Math.round(x),
          y: Math.round(ey(y) - estH),
          w: estW,
          h: estH,
          text,
          fontSize: Math.round(height),
          anchor: 'bottom-left' as AnchorPoint,
        });
      }
    }
  }

  return { panelWidth: Math.round(panelWidth), panelHeight: Math.round(panelHeight), elements };
}

/* ─── Bounding box helpers ─── */

function entityBounds(entities: any[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const expand = (x: number, y: number) => {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  };
  for (const e of entities) {
    if (e.type === 'CIRCLE') {
      expand(e.center.x - e.radius, e.center.y - e.radius);
      expand(e.center.x + e.radius, e.center.y + e.radius);
    } else if (e.vertices) {
      for (const v of e.vertices) expand(v.x, v.y);
    } else if (e.startPoint) {
      expand(e.startPoint.x, e.startPoint.y);
    }
  }
  return { minX, minY, maxX, maxY };
}

function vertsBounds(verts: { x: number; y: number }[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const v of verts) {
    if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
  }
  return { minX, minY, maxX, maxY };
}
