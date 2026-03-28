/**
 * Parses a DXF file string and converts its entities into SVG path data.
 * Returns the path `d` attribute and a bounding box.
 */
import DxfParser from 'dxf-parser';

interface DxfResult {
  pathData: string;
  viewBox: [number, number, number, number]; // minX, minY, width, height
  widthMM: number;
  heightMM: number;
}

export function parseDxfToSvg(dxfString: string): DxfResult {
  const parser = new DxfParser();
  const dxf = parser.parseSync(dxfString);
  if (!dxf || !dxf.entities || dxf.entities.length === 0) {
    throw new Error('No entities found in DXF file');
  }

  const segments: string[] = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const expand = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  for (const entity of dxf.entities) {
    switch (entity.type) {
      case 'LINE': {
        const e = entity as any;
        const v = e.vertices as { x: number; y: number }[];
        if (v && v.length >= 2) {
          expand(v[0].x, v[0].y);
          expand(v[1].x, v[1].y);
          segments.push(`M${v[0].x} ${v[0].y}L${v[1].x} ${v[1].y}`);
        }
        break;
      }
      case 'LWPOLYLINE':
      case 'POLYLINE': {
        const e = entity as any;
        const vertices: { x: number; y: number; bulge?: number }[] = e.vertices || [];
        if (vertices.length < 2) break;
        const closed = !!e.shape;
        let path = '';
        for (let i = 0; i < vertices.length; i++) {
          const v = vertices[i];
          expand(v.x, v.y);
          const bulge = v.bulge || 0;
          if (i === 0) {
            path += `M${v.x} ${v.y}`;
          }
          if (i < vertices.length - 1 || closed) {
            const next = vertices[(i + 1) % vertices.length];
            if (Math.abs(bulge) > 1e-6) {
              // Bulge → arc
              const arc = bulgeToArc(v.x, v.y, next.x, next.y, bulge);
              path += `A${arc.r} ${arc.r} 0 ${arc.large} ${arc.sweep} ${next.x} ${next.y}`;
            } else if (i < vertices.length - 1) {
              path += `L${next.x} ${next.y}`;
            }
          }
        }
        if (closed) path += 'Z';
        segments.push(path);
        break;
      }
      case 'CIRCLE': {
        const e = entity as any;
        const cx: number = e.center.x;
        const cy: number = e.center.y;
        const r: number = e.radius;
        expand(cx - r, cy - r);
        expand(cx + r, cy + r);
        // SVG circle as two arcs
        segments.push(
          `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`
        );
        break;
      }
      case 'ARC': {
        const e = entity as any;
        const cx: number = e.center.x;
        const cy: number = e.center.y;
        const r: number = e.radius;
        const startAngle: number = (e.startAngle || 0) * Math.PI / 180;
        const endAngle: number = (e.endAngle || 360) * Math.PI / 180;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        expand(x1, y1);
        expand(x2, y2);
        // Also expand for the extremes the arc might reach
        expand(cx - r, cy - r);
        expand(cx + r, cy + r);
        let angleDiff = endAngle - startAngle;
        if (angleDiff < 0) angleDiff += 2 * Math.PI;
        const large = angleDiff > Math.PI ? 1 : 0;
        segments.push(`M${x1} ${y1}A${r} ${r} 0 ${large} 1 ${x2} ${y2}`);
        break;
      }
      case 'ELLIPSE': {
        const e = entity as any;
        const cx: number = e.center.x;
        const cy: number = e.center.y;
        const mx: number = e.majorAxisEndPoint.x;
        const my: number = e.majorAxisEndPoint.y;
        const ratio: number = e.axisRatio || 1;
        const rx = Math.sqrt(mx * mx + my * my);
        const ry = rx * ratio;
        const angle = Math.atan2(my, mx) * 180 / Math.PI;
        expand(cx - rx, cy - ry);
        expand(cx + rx, cy + ry);
        segments.push(
          `M${cx - rx} ${cy}A${rx} ${ry} ${angle} 1 0 ${cx + rx} ${cy}A${rx} ${ry} ${angle} 1 0 ${cx - rx} ${cy}Z`
        );
        break;
      }
      case 'SPLINE': {
        const e = entity as any;
        const pts: { x: number; y: number }[] = e.controlPoints || e.fitPoints || [];
        if (pts.length < 2) break;
        for (const p of pts) expand(p.x, p.y);
        // Approximate spline as smooth cubic bezier through fit points
        if (pts.length === 2) {
          segments.push(`M${pts[0].x} ${pts[0].y}L${pts[1].x} ${pts[1].y}`);
        } else {
          let path = `M${pts[0].x} ${pts[0].y}`;
          for (let i = 1; i < pts.length - 1; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            path += `Q${pts[i].x} ${pts[i].y} ${xc} ${yc}`;
          }
          const last = pts[pts.length - 1];
          path += `L${last.x} ${last.y}`;
          segments.push(path);
        }
        break;
      }
      default:
        // Skip unsupported entity types (TEXT, DIMENSION, etc.)
        break;
    }
  }

  if (segments.length === 0) {
    throw new Error('No supported geometry found in DXF file');
  }

  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0 || height <= 0) {
    throw new Error('DXF geometry has zero or negative dimensions');
  }

  // DXF uses Y-up convention, SVG uses Y-down. Flip Y-axis by transforming coordinates.
  const flippedSegments = segments.map(seg =>
    flipY(seg, minY + maxY)
  );

  return {
    pathData: flippedSegments.join(''),
    viewBox: [minX, minY, width, height],
    widthMM: width,
    heightMM: height,
  };
}

/** Convert bulge value to SVG arc parameters */
function bulgeToArc(
  x1: number, y1: number, x2: number, y2: number, bulge: number
): { r: number; large: number; sweep: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const chord = Math.sqrt(dx * dx + dy * dy);
  const sagitta = Math.abs(bulge) * chord / 2;
  const r = (chord * chord / 4 + sagitta * sagitta) / (2 * sagitta);
  const large = Math.abs(bulge) > 1 ? 1 : 0;
  const sweep = bulge > 0 ? 0 : 1;
  return { r, large, sweep };
}

/** Flip Y-coordinates in an SVG path string for DXF Y-up → SVG Y-down */
function flipY(path: string, ySum: number): string {
  // Match coordinates: a number (possibly negative/decimal) that follows
  // a path command letter or comma/space separating coords.
  // We track whether the next number is an X or Y value.
  const tokens = path.match(/[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g);
  if (!tokens) return path;

  let result = '';
  let isY = false;
  let cmd = '';
  let paramIdx = 0;

  for (const token of tokens) {
    if (/[A-Za-z]/.test(token)) {
      cmd = token.toUpperCase();
      paramIdx = 0;
      isY = false;
      result += token;
      continue;
    }

    const num = parseFloat(token);
    // Determine if this parameter is a Y-coordinate based on command type
    let flipped = num;
    switch (cmd) {
      case 'M': case 'L':
        // x, y pairs
        if (paramIdx % 2 === 1) flipped = ySum - num;
        break;
      case 'A':
        // rx, ry, rotation, large-arc, sweep, x, y
        if (paramIdx % 7 === 6) flipped = ySum - num;
        // Also flip the sweep flag for Y flip
        if (paramIdx % 7 === 4) flipped = num === 0 ? 1 : 0;
        break;
      case 'Q':
        // x1, y1, x, y
        if (paramIdx % 4 === 1 || paramIdx % 4 === 3) flipped = ySum - num;
        break;
      case 'C':
        // x1,y1, x2,y2, x,y
        if (paramIdx % 6 === 1 || paramIdx % 6 === 3 || paramIdx % 6 === 5) flipped = ySum - num;
        break;
      case 'H':
        // horizontal - no Y flip
        break;
      case 'V':
        // vertical - flip
        flipped = ySum - num;
        break;
    }

    result += flipped + ' ';
    paramIdx++;
  }

  return result.trim();
}
