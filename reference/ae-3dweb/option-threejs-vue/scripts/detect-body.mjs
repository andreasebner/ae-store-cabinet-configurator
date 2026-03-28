/**
 * Smart Cabinet Body Detector
 *
 * Analyzes a GLB model to estimate the main rectangular body dimensions,
 * filtering out outliers like open doors, handles, hinges, etc.
 *
 * Approach:
 *   - Build a histogram of vertex positions per axis
 *   - Identify dense wall clusters (peaks) vs sparse outliers (door)
 *   - Estimate the box body from the two outermost dense clusters per axis
 *   - Suggest panel configs for all 6 faces using body dimensions
 *
 * Usage:
 *   node scripts/detect-body.mjs [file.glb]
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelsDir = join(__dirname, '..', 'public', 'models');

/* ── GLB parsing (reused from analyze-model.mjs) ────────────────── */

function parseGlb(filePath) {
  const buf = readFileSync(filePath);
  let off = 0;
  const magic = buf.readUInt32LE(off); off += 4;
  if (magic !== 0x46546C67) throw new Error('Not a GLB file');
  off += 4; off += 4;
  const jsonLen = buf.readUInt32LE(off); off += 4;
  off += 4;
  const gltf = JSON.parse(buf.slice(off, off + jsonLen).toString());
  off += jsonLen;
  off += 4; off += 4;
  const bin = buf.slice(off);
  return { gltf, bin };
}

function readAccessorData(gltf, bin, accessorIdx) {
  const acc = gltf.accessors[accessorIdx];
  const bv = gltf.bufferViews[acc.bufferView];
  const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const componentsPerElement = acc.type === 'VEC3' ? 3 : (acc.type === 'VEC2' ? 2 : 1);
  const count = acc.count * componentsPerElement;

  if (acc.componentType === 5126) {
    const aligned = new ArrayBuffer(count * 4);
    const u8 = new Uint8Array(aligned);
    for (let i = 0; i < count * 4; i++) u8[i] = bin[byteOffset + i];
    return { data: new Float32Array(aligned), count: acc.count, components: componentsPerElement };
  } else if (acc.componentType === 5125) {
    const aligned = new ArrayBuffer(count * 4);
    const u8 = new Uint8Array(aligned);
    for (let i = 0; i < count * 4; i++) u8[i] = bin[byteOffset + i];
    return { data: new Uint32Array(aligned), count: acc.count, components: 1 };
  } else {
    const aligned = new ArrayBuffer(count * 2);
    const u8 = new Uint8Array(aligned);
    for (let i = 0; i < count * 2; i++) u8[i] = bin[byteOffset + i];
    return { data: new Uint16Array(aligned), count: acc.count, components: 1 };
  }
}

/* ── Histogram & peak detection ──────────────────────────────────── */

function buildHistogram(values, binSize = 2) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const numBins = Math.ceil((max - min) / binSize) + 1;
  const bins = new Array(numBins).fill(0);
  const binStarts = [];
  for (let i = 0; i < numBins; i++) binStarts.push(min + i * binSize);

  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / binSize), numBins - 1);
    bins[idx]++;
  }
  return { bins, binStarts, binSize, min, max };
}

/**
 * Find dense wall clusters from a 1D histogram of vertex positions.
 * Returns sorted array of wall positions (histogram peaks above threshold).
 */
function findWallPositions(values, binSize = 2) {
  const hist = buildHistogram(values, binSize);
  const { bins, binStarts } = hist;

  // Threshold: peaks above 15% of the maximum bin count (to ignore noise)
  const maxCount = Math.max(...bins);
  const threshold = maxCount * 0.10;

  // Find peaks: bins with count > threshold and local max or wall bin
  const peaks = [];
  for (let i = 0; i < bins.length; i++) {
    if (bins[i] < threshold) continue;
    // Check if this is a local max or part of a cluster
    const isLocalMax = (i === 0 || bins[i] >= bins[i - 1]) &&
                       (i === bins.length - 1 || bins[i] >= bins[i + 1]);
    if (isLocalMax) {
      peaks.push({
        position: binStarts[i] + binSize / 2,
        count: bins[i],
      });
    }
  }

  // Merge peaks that are very close (within 5mm = wall thickness)
  const merged = [];
  for (const p of peaks) {
    if (merged.length > 0 && Math.abs(p.position - merged[merged.length - 1].position) < 10) {
      // Keep the stronger peak
      if (p.count > merged[merged.length - 1].count) {
        merged[merged.length - 1] = p;
      }
    } else {
      merged.push(p);
    }
  }

  return merged;
}

/**
 * From wall peaks, estimate the main body extent.
 *
 * Strategy: the cabinet body walls are the outermost peaks. An open door
 * or handle creates isolated vertices beyond one wall. We detect this by
 * checking for large gaps between the outermost peaks and their neighbours.
 *
 * Heuristic: if the gap from a boundary peak to its neighbour is > 40% of
 * the total peak range, that boundary is likely an outlier (door).
 * In that case, use the next peak inward.
 */
function estimateBodyExtent(peaks) {
  if (peaks.length < 2) {
    return { min: peaks[0]?.position ?? 0, max: peaks[0]?.position ?? 0 };
  }

  const sorted = [...peaks].sort((a, b) => a.position - b.position);

  if (sorted.length === 2) {
    return { min: sorted[0].position, max: sorted[1].position };
  }

  const totalRange = sorted[sorted.length - 1].position - sorted[0].position;
  const gapThreshold = totalRange * 0.35;

  // Check left boundary
  let minIdx = 0;
  if (sorted.length > 2) {
    const leftGap = sorted[1].position - sorted[0].position;
    if (leftGap > gapThreshold) {
      minIdx = 1; // skip outlier on the left
    }
  }

  // Check right boundary
  let maxIdx = sorted.length - 1;
  if (sorted.length > 2) {
    const rightGap = sorted[maxIdx].position - sorted[maxIdx - 1].position;
    if (rightGap > gapThreshold) {
      maxIdx = maxIdx - 1; // skip outlier on the right
    }
  }

  return {
    min: sorted[minIdx].position,
    max: sorted[maxIdx].position,
    outlierLeft: minIdx > 0,
    outlierRight: maxIdx < sorted.length - 1,
  };
}

/* ── Main analysis ──────────────────────────────────────────────── */

function analyzeBody(filePath) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Body Detection: ${basename(filePath)}`);
  console.log('='.repeat(70));

  const { gltf, bin } = parseGlb(filePath);

  // Collect all vertices
  const allPositions = [];
  for (const mesh of gltf.meshes) {
    for (const prim of mesh.primitives) {
      const posAcc = readAccessorData(gltf, bin, prim.attributes.POSITION);
      allPositions.push(posAcc.data);
    }
  }

  // Merge into one array
  let totalLen = 0;
  for (const a of allPositions) totalLen += a.length;
  const pos = new Float32Array(totalLen);
  let off = 0;
  for (const a of allPositions) { pos.set(a, off); off += a.length; }

  const numVerts = pos.length / 3;
  console.log(`\nTotal vertices: ${numVerts}`);

  // Extract per-axis arrays
  const xVals = [], yVals = [], zVals = [];
  for (let i = 0; i < pos.length; i += 3) {
    xVals.push(pos[i]);
    yVals.push(pos[i + 1]);
    zVals.push(pos[i + 2]);
  }

  // Full bounding box
  const fullBbox = {
    x: [Math.min(...xVals), Math.max(...xVals)],
    y: [Math.min(...yVals), Math.max(...yVals)],
    z: [Math.min(...zVals), Math.max(...zVals)],
  };
  console.log(`\nFull Bounding Box (including door/outliers):`);
  console.log(`  X: [${fullBbox.x[0].toFixed(1)}, ${fullBbox.x[1].toFixed(1)}]  size: ${(fullBbox.x[1]-fullBbox.x[0]).toFixed(1)} mm`);
  console.log(`  Y: [${fullBbox.y[0].toFixed(1)}, ${fullBbox.y[1].toFixed(1)}]  size: ${(fullBbox.y[1]-fullBbox.y[0]).toFixed(1)} mm`);
  console.log(`  Z: [${fullBbox.z[0].toFixed(1)}, ${fullBbox.z[1].toFixed(1)}]  size: ${(fullBbox.z[1]-fullBbox.z[0]).toFixed(1)} mm`);

  // Percentile-based robust estimate (10th-90th percentile)
  function percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * p);
    return sorted[Math.min(idx, sorted.length - 1)];
  }

  const p05 = 0.02, p95 = 0.98;
  const robustBbox = {
    x: [percentile(xVals, p05), percentile(xVals, p95)],
    y: [percentile(yVals, p05), percentile(yVals, p95)],
    z: [percentile(zVals, p05), percentile(zVals, p95)],
  };
  console.log(`\nRobust Bounding Box (2nd-98th percentile):`);
  console.log(`  X: [${robustBbox.x[0].toFixed(1)}, ${robustBbox.x[1].toFixed(1)}]  size: ${(robustBbox.x[1]-robustBbox.x[0]).toFixed(1)} mm`);
  console.log(`  Y: [${robustBbox.y[0].toFixed(1)}, ${robustBbox.y[1].toFixed(1)}]  size: ${(robustBbox.y[1]-robustBbox.y[0]).toFixed(1)} mm`);
  console.log(`  Z: [${robustBbox.z[0].toFixed(1)}, ${robustBbox.z[1].toFixed(1)}]  size: ${(robustBbox.z[1]-robustBbox.z[0]).toFixed(1)} mm`);

  // Histogram wall detection per axis
  console.log(`\n--- Vertex Distribution Analysis ---`);
  const axisData = [
    { name: 'X', values: xVals },
    { name: 'Y', values: yVals },
    { name: 'Z', values: zVals },
  ];

  const bodyExtents = {};
  for (const { name, values } of axisData) {
    console.log(`\n  ${name}-axis wall peaks:`);
    const peaks = findWallPositions(values, 2);
    for (const p of peaks) {
      console.log(`    pos=${p.position.toFixed(1)}  vertices=${p.count}`);
    }

    const extent = estimateBodyExtent(peaks);
    bodyExtents[name.toLowerCase()] = extent;
    const outlierNote = (extent.outlierLeft ? ' [outlier skipped on left]' : '') +
                        (extent.outlierRight ? ' [outlier skipped on right]' : '');
    console.log(`  → Estimated body ${name}: [${extent.min.toFixed(1)}, ${extent.max.toFixed(1)}]  size: ${(extent.max - extent.min).toFixed(1)} mm${outlierNote}`);
  }

  // Compute body dimensions
  const bodyW = bodyExtents.x.max - bodyExtents.x.min;
  const bodyH = bodyExtents.y.max - bodyExtents.y.min;
  const bodyD = bodyExtents.z.max - bodyExtents.z.min;
  const bodyCenter = {
    x: (bodyExtents.x.min + bodyExtents.x.max) / 2,
    y: (bodyExtents.y.min + bodyExtents.y.max) / 2,
    z: (bodyExtents.z.min + bodyExtents.z.max) / 2,
  };

  // Full bbox center (used for model centering in Three.js)
  const fullCenter = {
    x: (fullBbox.x[0] + fullBbox.x[1]) / 2,
    y: (fullBbox.y[0] + fullBbox.y[1]) / 2,
    z: (fullBbox.z[0] + fullBbox.z[1]) / 2,
  };

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`ESTIMATED CABINET BODY DIMENSIONS:`);
  console.log(`  X (width/depth?): ${bodyW.toFixed(1)} mm`);
  console.log(`  Y (height?):      ${bodyH.toFixed(1)} mm`);
  console.log(`  Z (depth/width?): ${bodyD.toFixed(1)} mm`);
  console.log(`  Body center (raw): (${bodyCenter.x.toFixed(1)}, ${bodyCenter.y.toFixed(1)}, ${bodyCenter.z.toFixed(1)})`);
  console.log(`  Full bbox center:  (${fullCenter.x.toFixed(1)}, ${fullCenter.y.toFixed(1)}, ${fullCenter.z.toFixed(1)})`);
  console.log(`  Body center offset from full center: (${(bodyCenter.x - fullCenter.x).toFixed(1)}, ${(bodyCenter.y - fullCenter.y).toFixed(1)}, ${(bodyCenter.z - fullCenter.z).toFixed(1)})`);

  // Sort dimensions to identify largest/smallest
  const dims = [
    { axis: 'X', size: bodyW },
    { axis: 'Y', size: bodyH },
    { axis: 'Z', size: bodyD },
  ].sort((a, b) => b.size - a.size);

  console.log(`\n  Dimensions sorted (largest first):`);
  dims.forEach((d, i) => {
    const label = i === 0 ? 'LARGEST (height?)' : i === 1 ? 'MEDIUM (width?)' : 'SMALLEST (depth?)';
    console.log(`    ${d.axis}: ${d.size.toFixed(1)} mm  ← ${label}`);
  });

  // Generate panel configs for all 6 faces, using BODY dimensions
  // Note: after Three.js centering, the model is shifted by -fullCenter.
  // Body center in centered coords = bodyCenter - fullCenter
  const bodyCentered = {
    x: bodyCenter.x - fullCenter.x,
    y: bodyCenter.y - fullCenter.y,
    z: bodyCenter.z - fullCenter.z,
  };

  console.log(`\n  Body center (in centered model coords): (${bodyCentered.x.toFixed(1)}, ${bodyCentered.y.toFixed(1)}, ${bodyCentered.z.toFixed(1)})`);

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`SUGGESTED PANEL CONFIGS (copy-paste into models.js):`);
  console.log(`(In centered model coordinates, panel placed on body surface)\n`);

  const panels = [
    {
      name: '+X face', desc: `${bodyD.toFixed(0)}×${bodyH.toFixed(0)}`,
      normal: [1, 0, 0], uAxis: [0, 0, 1], vAxis: [0, 1, 0],
      center: [bodyCentered.x + bodyW / 2, bodyCentered.y, bodyCentered.z],
      width: bodyD, height: bodyH,
    },
    {
      name: '-X face', desc: `${bodyD.toFixed(0)}×${bodyH.toFixed(0)}`,
      normal: [-1, 0, 0], uAxis: [0, 0, -1], vAxis: [0, 1, 0],
      center: [bodyCentered.x - bodyW / 2, bodyCentered.y, bodyCentered.z],
      width: bodyD, height: bodyH,
    },
    {
      name: '+Y face (top)', desc: `${bodyW.toFixed(0)}×${bodyD.toFixed(0)}`,
      normal: [0, 1, 0], uAxis: [1, 0, 0], vAxis: [0, 0, 1],
      center: [bodyCentered.x, bodyCentered.y + bodyH / 2, bodyCentered.z],
      width: bodyW, height: bodyD,
    },
    {
      name: '-Y face (bottom)', desc: `${bodyW.toFixed(0)}×${bodyD.toFixed(0)}`,
      normal: [0, -1, 0], uAxis: [1, 0, 0], vAxis: [0, 0, -1],
      center: [bodyCentered.x, bodyCentered.y - bodyH / 2, bodyCentered.z],
      width: bodyW, height: bodyD,
    },
    {
      name: '+Z face', desc: `${bodyW.toFixed(0)}×${bodyH.toFixed(0)}`,
      normal: [0, 0, 1], uAxis: [1, 0, 0], vAxis: [0, 1, 0],
      center: [bodyCentered.x, bodyCentered.y, bodyCentered.z + bodyD / 2],
      width: bodyW, height: bodyH,
    },
    {
      name: '-Z face', desc: `${bodyW.toFixed(0)}×${bodyH.toFixed(0)}`,
      normal: [0, 0, -1], uAxis: [-1, 0, 0], vAxis: [0, 1, 0],
      center: [bodyCentered.x, bodyCentered.y, bodyCentered.z - bodyD / 2],
      width: bodyW, height: bodyH,
    },
  ];

  for (const p of panels) {
    console.log(`  // ${p.name} — ${p.desc} mm`);
    console.log(`  {`);
    console.log(`    normal: [${p.normal}],`);
    console.log(`    uAxis:  [${p.uAxis}],`);
    console.log(`    vAxis:  [${p.vAxis}],`);
    console.log(`    center: [${p.center.map(v => Math.round(v * 10) / 10)}],`);
    console.log(`    width:  ${Math.round(p.width)},`);
    console.log(`    height: ${Math.round(p.height)},`);
    console.log(`  }\n`);
  }
}

// Main
const args = process.argv.slice(2);
let files;
if (args.length > 0) {
  files = args.map(f => f.startsWith('/') ? f : join(modelsDir, f));
} else {
  files = readdirSync(modelsDir).filter(f => f.endsWith('.glb')).map(f => join(modelsDir, f));
}
if (files.length === 0) {
  console.error('No GLB files found.');
  process.exit(1);
}
for (const f of files) analyzeBody(f);
