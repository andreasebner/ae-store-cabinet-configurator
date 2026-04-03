/**
 * Convert the new cabinet STEP file to GLB with per-mesh separation
 * so we can identify the door (largest flat panel) vs body.
 *
 * Usage: node scripts/convert-step.mjs <input.step> <output.glb>
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const refNodeModules = join(__dirname, '..', 'reference', 'ae-3dweb', 'option-threejs-vue', 'node_modules');
const _require = createRequire(join(refNodeModules, '.placeholder'));
const occtimportjs = _require('occt-import-js');

/** Pad to 4-byte alignment */
const pad4 = (n) => (n + 3) & ~3;

/** Build a GLB keeping each OCCT mesh as a separate glTF mesh/node */
function buildGlb(result) {
  const meshDataList = [];

  for (const mesh of result.meshes) {
    const pos = new Float32Array(mesh.attributes.position.array);
    const norm = mesh.attributes.normal
      ? new Float32Array(mesh.attributes.normal.array)
      : (() => {
          const n = new Float32Array(pos.length);
          for (let i = 2; i < n.length; i += 3) n[i] = 1;
          return n;
        })();
    const idx = pos.length / 3 > 65535
      ? new Uint32Array(mesh.index.array)
      : new Uint16Array(mesh.index.array);

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < pos.length; i += 3) {
      minX = Math.min(minX, pos[i]);     maxX = Math.max(maxX, pos[i]);
      minY = Math.min(minY, pos[i + 1]); maxY = Math.max(maxY, pos[i + 1]);
      minZ = Math.min(minZ, pos[i + 2]); maxZ = Math.max(maxZ, pos[i + 2]);
    }

    meshDataList.push({
      pos, norm, idx,
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      vertexCount: pos.length / 3,
      indexCount: idx.length,
      name: mesh.name || `mesh_${meshDataList.length}`,
      color: mesh.color ? { r: mesh.color.r, g: mesh.color.g, b: mesh.color.b } : null,
    });
  }

  // Print mesh summary for analysis
  console.log(`\n  Mesh summary (${meshDataList.length} meshes):`);
  for (const m of meshDataList) {
    const sx = m.max[0] - m.min[0], sy = m.max[1] - m.min[1], sz = m.max[2] - m.min[2];
    console.log(`    ${m.name}: ${m.vertexCount} verts, size ${sx.toFixed(1)} x ${sy.toFixed(1)} x ${sz.toFixed(1)}, color: ${JSON.stringify(m.color)}`);
  }

  // Compute byte layout
  let binSize = 0;
  const bufferViews = [];
  const accessors = [];
  const nodes = [];
  const meshes = [];
  const materials = [];
  const sceneNodes = [];

  // One default material for body
  materials.push({
    pbrMetallicRoughness: {
      baseColorFactor: [0.533, 0.6, 0.667, 1.0],
      metallicFactor: 0.3,
      roughnessFactor: 0.6,
    },
    name: 'body',
  });

  let accessorIdx = 0;
  for (let mi = 0; mi < meshDataList.length; mi++) {
    const m = meshDataList[mi];
    const idxCompType = m.idx.BYTES_PER_ELEMENT === 4 ? 5125 : 5123;

    // Index buffer view
    const idxOffset = binSize;
    const idxByteLen = m.idx.byteLength;
    bufferViews.push({ buffer: 0, byteOffset: idxOffset, byteLength: idxByteLen, target: 34963 });
    binSize += pad4(idxByteLen);

    // Position buffer view
    const posOffset = binSize;
    const posByteLen = m.pos.byteLength;
    bufferViews.push({ buffer: 0, byteOffset: posOffset, byteLength: posByteLen, target: 34962 });
    binSize += pad4(posByteLen);

    // Normal buffer view
    const normOffset = binSize;
    const normByteLen = m.norm.byteLength;
    bufferViews.push({ buffer: 0, byteOffset: normOffset, byteLength: normByteLen, target: 34962 });
    binSize += pad4(normByteLen);

    const bvBase = mi * 3;

    // Accessors: [idx, pos, norm]
    accessors.push({
      bufferView: bvBase,
      componentType: idxCompType,
      count: m.indexCount,
      type: 'SCALAR',
      max: [Math.max(...m.idx)],
      min: [Math.min(...m.idx)],
    });
    accessors.push({
      bufferView: bvBase + 1,
      componentType: 5126,
      count: m.vertexCount,
      type: 'VEC3',
      max: m.max,
      min: m.min,
    });
    accessors.push({
      bufferView: bvBase + 2,
      componentType: 5126,
      count: m.vertexCount,
      type: 'VEC3',
      max: [1, 1, 1],
      min: [-1, -1, -1],
    });

    meshes.push({
      name: m.name,
      primitives: [{
        attributes: { POSITION: accessorIdx + 1, NORMAL: accessorIdx + 2 },
        indices: accessorIdx,
        material: 0,
        mode: 4,
      }],
    });
    nodes.push({ mesh: mi, name: m.name });
    sceneNodes.push(mi);

    accessorIdx += 3;
  }

  const gltfJson = {
    asset: { version: '2.0', generator: 'ae-step-converter' },
    scene: 0,
    scenes: [{ nodes: sceneNodes }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binSize }],
  };

  // Pack binary
  const jsonString = JSON.stringify(gltfJson);
  const jsonBuf = Buffer.from(jsonString, 'utf8');
  const jsonPadded = Buffer.alloc(pad4(jsonBuf.length), 0x20);
  jsonBuf.copy(jsonPadded);

  const binBuffer = Buffer.alloc(binSize);
  let bOff = 0;
  for (const m of meshDataList) {
    Buffer.from(m.idx.buffer, m.idx.byteOffset, m.idx.byteLength).copy(binBuffer, bOff);
    bOff += pad4(m.idx.byteLength);
    Buffer.from(m.pos.buffer, m.pos.byteOffset, m.pos.byteLength).copy(binBuffer, bOff);
    bOff += pad4(m.pos.byteLength);
    Buffer.from(m.norm.buffer, m.norm.byteOffset, m.norm.byteLength).copy(binBuffer, bOff);
    bOff += pad4(m.norm.byteLength);
  }

  const totalLen = 12 + 8 + jsonPadded.length + 8 + binBuffer.length;
  const glb = Buffer.alloc(totalLen);
  let off = 0;
  glb.writeUInt32LE(0x46546C67, off); off += 4; // magic
  glb.writeUInt32LE(2, off); off += 4;            // version
  glb.writeUInt32LE(totalLen, off); off += 4;      // total length

  glb.writeUInt32LE(jsonPadded.length, off); off += 4;
  glb.writeUInt32LE(0x4E4F534A, off); off += 4; // JSON
  jsonPadded.copy(glb, off); off += jsonPadded.length;

  glb.writeUInt32LE(binBuffer.length, off); off += 4;
  glb.writeUInt32LE(0x004E4942, off); off += 4; // BIN
  binBuffer.copy(glb, off);

  return { glb, meshSummary: meshDataList.map(m => ({
    name: m.name,
    vertexCount: m.vertexCount,
    size: [m.max[0]-m.min[0], m.max[1]-m.min[1], m.max[2]-m.min[2]],
    min: m.min,
    max: m.max,
    color: m.color,
  }))};
}

async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0];
  const outputFile = args[1];

  if (!inputFile || !outputFile) {
    console.error('Usage: node convert-step.mjs <input.step> <output.glb>');
    process.exit(1);
  }

  console.log('Initializing occt-import-js...');
  const occt = await occtimportjs();
  console.log('OCCT ready.');
  console.log('Reading:', inputFile);

  const fileContent = new Uint8Array(readFileSync(inputFile));
  const result = occt.ReadStepFile(fileContent, null);

  console.log('Total meshes from OCCT:', result.meshes.length);
  if (result.meshes.length === 0) {
    console.error('No geometry found!');
    process.exit(1);
  }

  const { glb, meshSummary } = buildGlb(result);

  // Compute bounding box of entire model
  let gMin = [Infinity, Infinity, Infinity];
  let gMax = [-Infinity, -Infinity, -Infinity];
  for (const m of meshSummary) {
    for (let i = 0; i < 3; i++) {
      gMin[i] = Math.min(gMin[i], m.min[i]);
      gMax[i] = Math.max(gMax[i], m.max[i]);
    }
  }
  const dims = [gMax[0] - gMin[0], gMax[1] - gMin[1], gMax[2] - gMin[2]];
  console.log(`\n  Model bounding box: ${dims[0].toFixed(2)} x ${dims[1].toFixed(2)} x ${dims[2].toFixed(2)}`);
  console.log(`  Min: [${gMin.map(v=>v.toFixed(2)).join(', ')}]`);
  console.log(`  Max: [${gMax.map(v=>v.toFixed(2)).join(', ')}]`);

  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, glb);
  console.log(`\nWritten: ${outputFile} (${(glb.length / 1024).toFixed(1)} KB)`);

  // Write mesh summary JSON alongside for analysis
  const summaryPath = outputFile.replace(/\.glb$/, '-meshes.json');
  writeFileSync(summaryPath, JSON.stringify(meshSummary, null, 2));
  console.log('Mesh summary:', summaryPath);
}

main().catch(err => { console.error(err); process.exit(1); });
