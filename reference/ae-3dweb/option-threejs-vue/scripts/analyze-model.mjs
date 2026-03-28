/**
 * GLB Model Analyzer — Diagnostic script for face discovery.
 *
 * Parses a GLB file, computes bounding box, clusters triangle normals
 * to identify major planar faces, and outputs a suggested model config.
 *
 * Usage:
 *   node scripts/analyze-model.mjs [file.glb]
 *
 * If no file given, analyzes all .glb files in public/models/.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelsDir = join(__dirname, '..', 'public', 'models');

function parseGlb(filePath) {
  const buf = readFileSync(filePath);
  let off = 0;

  // Header
  const magic = buf.readUInt32LE(off); off += 4;
  if (magic !== 0x46546C67) throw new Error('Not a GLB file');
  off += 4; // version
  off += 4; // length

  // JSON chunk
  const jsonLen = buf.readUInt32LE(off); off += 4;
  off += 4; // chunk type
  const gltf = JSON.parse(buf.slice(off, off + jsonLen).toString());
  off += jsonLen;

  // BIN chunk
  off += 4; // bin length
  off += 4; // chunk type
  const bin = buf.slice(off);

  return { gltf, bin };
}

function readAccessorData(gltf, bin, accessorIdx) {
  const acc = gltf.accessors[accessorIdx];
  const bv = gltf.bufferViews[acc.bufferView];
  const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const componentSize = acc.componentType === 5126 ? 4 : (acc.componentType === 5125 ? 4 : 2);
  const componentsPerElement = acc.type === 'VEC3' ? 3 : (acc.type === 'VEC2' ? 2 : 1);
  const count = acc.count * componentsPerElement;

  if (acc.componentType === 5126) {
    // Float32
    const aligned = new ArrayBuffer(count * 4);
    const u8 = new Uint8Array(aligned);
    for (let i = 0; i < count * 4; i++) u8[i] = bin[byteOffset + i];
    return { data: new Float32Array(aligned), count: acc.count, components: componentsPerElement };
  } else if (acc.componentType === 5125) {
    // Uint32
    const aligned = new ArrayBuffer(count * 4);
    const u8 = new Uint8Array(aligned);
    for (let i = 0; i < count * 4; i++) u8[i] = bin[byteOffset + i];
    return { data: new Uint32Array(aligned), count: acc.count, components: 1 };
  } else {
    // Uint16
    const aligned = new ArrayBuffer(count * 2);
    const u8 = new Uint8Array(aligned);
    for (let i = 0; i < count * 2; i++) u8[i] = bin[byteOffset + i];
    return { data: new Uint16Array(aligned), count: acc.count, components: 1 };
  }
}

function analyzeModel(filePath) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Analyzing: ${basename(filePath)}`);
  console.log('='.repeat(60));

  const { gltf, bin } = parseGlb(filePath);

  // Collect all position data across all mesh primitives
  let allPositions = [];
  let allIndices = [];
  let allNormals = [];
  let indexOffset = 0;

  for (const mesh of gltf.meshes) {
    for (const prim of mesh.primitives) {
      const posAcc = readAccessorData(gltf, bin, prim.attributes.POSITION);
      allPositions.push(posAcc.data);

      if (prim.indices !== undefined) {
        const idxAcc = readAccessorData(gltf, bin, prim.indices);
        const shifted = new Uint32Array(idxAcc.data.length);
        for (let i = 0; i < idxAcc.data.length; i++) shifted[i] = idxAcc.data[i] + indexOffset;
        allIndices.push(shifted);
      }

      if (prim.attributes.NORMAL !== undefined) {
        const normAcc = readAccessorData(gltf, bin, prim.attributes.NORMAL);
        allNormals.push(normAcc.data);
      }

      indexOffset += posAcc.count;
    }
  }

  // Merge arrays
  const mergedPos = mergeFloat32(allPositions);
  const mergedIdx = allIndices.length > 0 ? mergeUint32(allIndices) : null;
  const mergedNorm = allNormals.length > 0 ? mergeFloat32(allNormals) : null;

  // Bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < mergedPos.length; i += 3) {
    minX = Math.min(minX, mergedPos[i]);     maxX = Math.max(maxX, mergedPos[i]);
    minY = Math.min(minY, mergedPos[i+1]);   maxY = Math.max(maxY, mergedPos[i+1]);
    minZ = Math.min(minZ, mergedPos[i+2]);   maxZ = Math.max(maxZ, mergedPos[i+2]);
  }

  const sizeX = maxX - minX, sizeY = maxY - minY, sizeZ = maxZ - minZ;
  const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2, centerZ = (minZ + maxZ) / 2;

  console.log(`\nBounding Box (raw):`);
  console.log(`  X: [${minX.toFixed(2)}, ${maxX.toFixed(2)}]  size: ${sizeX.toFixed(2)} mm`);
  console.log(`  Y: [${minY.toFixed(2)}, ${maxY.toFixed(2)}]  size: ${sizeY.toFixed(2)} mm`);
  console.log(`  Z: [${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]  size: ${sizeZ.toFixed(2)} mm`);
  console.log(`  Center: (${centerX.toFixed(2)}, ${centerY.toFixed(2)}, ${centerZ.toFixed(2)})`);

  console.log(`\nBounding Box (after centering):`);
  console.log(`  X: ${sizeX.toFixed(2)} mm  (half: ±${(sizeX/2).toFixed(2)})`);
  console.log(`  Y: ${sizeY.toFixed(2)} mm  (half: ±${(sizeY/2).toFixed(2)})`);
  console.log(`  Z: ${sizeZ.toFixed(2)} mm  (half: ±${(sizeZ/2).toFixed(2)})`);

  // Sort axes by size
  const axes = [
    { name: 'X', size: sizeX },
    { name: 'Y', size: sizeY },
    { name: 'Z', size: sizeZ },
  ].sort((a, b) => b.size - a.size);

  console.log(`\nAxes sorted by size:`);
  axes.forEach((a, i) => console.log(`  ${i+1}. ${a.name}: ${a.size.toFixed(2)} mm`));

  // Cluster triangle normals to find major faces
  if (mergedIdx && mergedNorm) {
    console.log(`\nTriangle Normal Clustering:`);
    const numTris = mergedIdx.length / 3;
    console.log(`  Total triangles: ${numTris}`);

    // Use face normals from triangle vertices (average of 3 vertex normals)
    const faceNormals = [];
    for (let t = 0; t < mergedIdx.length; t += 3) {
      const i0 = mergedIdx[t], i1 = mergedIdx[t+1], i2 = mergedIdx[t+2];
      // Average vertex normals
      let nx = 0, ny = 0, nz = 0;
      for (const idx of [i0, i1, i2]) {
        nx += mergedNorm[idx*3];
        ny += mergedNorm[idx*3+1];
        nz += mergedNorm[idx*3+2];
      }
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      if (len > 0) {
        faceNormals.push([nx/len, ny/len, nz/len]);
      }
    }

    // Cluster normals into the 6 axis-aligned directions (+X, -X, +Y, -Y, +Z, -Z)
    const clusters = {
      '+X': { count: 0, tris: [] }, '-X': { count: 0, tris: [] },
      '+Y': { count: 0, tris: [] }, '-Y': { count: 0, tris: [] },
      '+Z': { count: 0, tris: [] }, '-Z': { count: 0, tris: [] },
      'other': { count: 0 },
    };

    const threshold = 0.7; // cos(45°) ≈ 0.707
    for (let i = 0; i < faceNormals.length; i++) {
      const [nx, ny, nz] = faceNormals[i];
      if (nx > threshold)      clusters['+X'].count++;
      else if (nx < -threshold) clusters['-X'].count++;
      else if (ny > threshold)  clusters['+Y'].count++;
      else if (ny < -threshold) clusters['-Y'].count++;
      else if (nz > threshold)  clusters['+Z'].count++;
      else if (nz < -threshold) clusters['-Z'].count++;
      else clusters['other'].count++;
    }

    console.log(`\n  Face normal clusters (threshold=${threshold}):`);
    const sorted = Object.entries(clusters)
      .filter(([k]) => k !== 'other')
      .sort((a, b) => b[1].count - a[1].count);
    sorted.forEach(([dir, { count }]) => {
      const pct = ((count / faceNormals.length) * 100).toFixed(1);
      console.log(`    ${dir}: ${count} triangles (${pct}%)`);
    });
    console.log(`    other: ${clusters['other'].count} triangles`);

    // For each axis-aligned face, estimate the bounding rectangle on that face
    console.log(`\n  Face bounding rectangles (on centered model):`);
    const halfX = sizeX / 2, halfY = sizeY / 2, halfZ = sizeZ / 2;

    const faceConfigs = [
      { dir: '+X', normal: [1,0,0], uAxis: [0,0,1], vAxis: [0,1,0], center: [halfX,0,0],  w: sizeZ, h: sizeY },
      { dir: '-X', normal: [-1,0,0], uAxis: [0,0,-1], vAxis: [0,1,0], center: [-halfX,0,0], w: sizeZ, h: sizeY },
      { dir: '+Y', normal: [0,1,0], uAxis: [1,0,0], vAxis: [0,0,1], center: [0,halfY,0],   w: sizeX, h: sizeZ },
      { dir: '-Y', normal: [0,-1,0], uAxis: [1,0,0], vAxis: [0,0,-1], center: [0,-halfY,0], w: sizeX, h: sizeZ },
      { dir: '+Z', normal: [0,0,1], uAxis: [1,0,0], vAxis: [0,1,0], center: [0,0,halfZ],   w: sizeX, h: sizeY },
      { dir: '-Z', normal: [0,0,-1], uAxis: [-1,0,0], vAxis: [0,1,0], center: [0,0,-halfZ], w: sizeX, h: sizeY },
    ];

    console.log();
    for (const fc of faceConfigs) {
      const cl = clusters[fc.dir];
      console.log(`    ${fc.dir} face: ${fc.w.toFixed(1)} × ${fc.h.toFixed(1)} mm  (${cl.count} tris)`);
      console.log(`      normal: [${fc.normal}], uAxis: [${fc.uAxis}], vAxis: [${fc.vAxis}]`);
      console.log(`      center: [${fc.center.map(v=>v.toFixed(1))}]`);
      console.log(`      → editFace config:`);
      console.log(`        {`);
      console.log(`          normal: [${fc.normal}],`);
      console.log(`          uAxis: [${fc.uAxis}],`);
      console.log(`          vAxis: [${fc.vAxis}],`);
      console.log(`          center: [${fc.center.map(v=>Math.round(v))}],`);
      console.log(`          width: ${Math.round(fc.w)},`);
      console.log(`          height: ${Math.round(fc.h)},`);
      console.log(`        }`);
    }
  }

  console.log(`\nDone.\n`);
}

function mergeFloat32(arrays) {
  let total = 0;
  for (const a of arrays) total += a.length;
  const result = new Float32Array(total);
  let off = 0;
  for (const a of arrays) { result.set(a, off); off += a.length; }
  return result;
}

function mergeUint32(arrays) {
  let total = 0;
  for (const a of arrays) total += a.length;
  const result = new Uint32Array(total);
  let off = 0;
  for (const a of arrays) { result.set(a, off); off += a.length; }
  return result;
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
  console.error('No GLB files found. Run convert-step.mjs first.');
  process.exit(1);
}

for (const f of files) {
  analyzeModel(f);
}
