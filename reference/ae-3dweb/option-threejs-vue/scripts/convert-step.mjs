/**
 * STEP → GLB conversion script using occt-import-js
 *
 * Reads STEP files from the project root (../../*.step, ../../*.STEP),
 * triangulates them, and writes .glb files to public/models/.
 *
 * Usage: node scripts/convert-step.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import occtimportjs from 'occt-import-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');
const outputDir = join(__dirname, '..', 'public', 'models');

/** Build a minimal GLB (Binary glTF) from occt-import-js result */
function buildGlb(result) {
  const allPositions = [];
  const allNormals = [];
  const allIndices = [];
  let indexOffset = 0;

  for (const mesh of result.meshes) {
    const pos = mesh.attributes.position.array;
    const norm = mesh.attributes.normal ? mesh.attributes.normal.array : null;
    const idx = mesh.index.array;

    for (let i = 0; i < pos.length; i++) allPositions.push(pos[i]);
    if (norm) {
      for (let i = 0; i < norm.length; i++) allNormals.push(norm[i]);
    } else {
      for (let i = 0; i < pos.length; i++) allNormals.push(i % 3 === 2 ? 1 : 0);
    }
    for (let i = 0; i < idx.length; i++) allIndices.push(idx[i] + indexOffset);
    indexOffset += pos.length / 3;
  }

  const positionArray = new Float32Array(allPositions);
  const normalArray = new Float32Array(allNormals);
  const indexArray = allIndices.length > 65535
    ? new Uint32Array(allIndices)
    : new Uint16Array(allIndices);

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positionArray.length; i += 3) {
    minX = Math.min(minX, positionArray[i]);
    minY = Math.min(minY, positionArray[i + 1]);
    minZ = Math.min(minZ, positionArray[i + 2]);
    maxX = Math.max(maxX, positionArray[i]);
    maxY = Math.max(maxY, positionArray[i + 1]);
    maxZ = Math.max(maxZ, positionArray[i + 2]);
  }

  const indexComponentType = allIndices.length > 65535 ? 5125 : 5123;
  const pad4 = (n) => (n + 3) & ~3;
  const indexPadded = pad4(indexArray.byteLength);
  const positionPadded = pad4(positionArray.byteLength);
  const normalPadded = pad4(normalArray.byteLength);
  const totalBufferLength = indexPadded + positionPadded + normalPadded;

  const gltfJson = {
    asset: { version: '2.0', generator: 'cabinet-hole-editor-converter' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 1, NORMAL: 2 }, indices: 0, mode: 4 }] }],
    accessors: [
      { bufferView: 0, componentType: indexComponentType, count: allIndices.length, type: 'SCALAR',
        max: [Math.max(...allIndices)], min: [Math.min(...allIndices)] },
      { bufferView: 1, componentType: 5126, count: positionArray.length / 3, type: 'VEC3',
        max: [maxX, maxY, maxZ], min: [minX, minY, minZ] },
      { bufferView: 2, componentType: 5126, count: normalArray.length / 3, type: 'VEC3',
        max: [1, 1, 1], min: [-1, -1, -1] }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: indexArray.byteLength, target: 34963 },
      { buffer: 0, byteOffset: indexPadded, byteLength: positionArray.byteLength, target: 34962 },
      { buffer: 0, byteOffset: indexPadded + positionPadded, byteLength: normalArray.byteLength, target: 34962 }
    ],
    buffers: [{ byteLength: totalBufferLength }]
  };

  const jsonString = JSON.stringify(gltfJson);
  const jsonBuffer = Buffer.from(jsonString, 'utf8');
  const jsonPaddedBuf = Buffer.alloc(pad4(jsonBuffer.length), 0x20);
  jsonBuffer.copy(jsonPaddedBuf);

  const binBuffer = Buffer.alloc(totalBufferLength);
  Buffer.from(indexArray.buffer).copy(binBuffer, 0);
  Buffer.from(positionArray.buffer).copy(binBuffer, indexPadded);
  Buffer.from(normalArray.buffer).copy(binBuffer, indexPadded + positionPadded);

  const totalLength = 12 + 8 + jsonPaddedBuf.length + 8 + binBuffer.length;
  const glb = Buffer.alloc(totalLength);
  let offset = 0;

  glb.writeUInt32LE(0x46546C67, offset); offset += 4;
  glb.writeUInt32LE(2, offset); offset += 4;
  glb.writeUInt32LE(totalLength, offset); offset += 4;

  glb.writeUInt32LE(jsonPaddedBuf.length, offset); offset += 4;
  glb.writeUInt32LE(0x4E4F534A, offset); offset += 4;
  jsonPaddedBuf.copy(glb, offset); offset += jsonPaddedBuf.length;

  glb.writeUInt32LE(binBuffer.length, offset); offset += 4;
  glb.writeUInt32LE(0x004E4942, offset); offset += 4;
  binBuffer.copy(glb, offset);

  return glb;
}

async function main() {
  console.log('Initializing occt-import-js...');
  const occt = await occtimportjs();
  console.log('OCCT ready.');

  const allFiles = readdirSync(projectRoot);
  const stepFiles = allFiles.filter(f =>
    f.toLowerCase().endsWith('.step') || f.toLowerCase().endsWith('.stp')
  );

  if (stepFiles.length === 0) {
    console.error('No STEP files found in', projectRoot);
    process.exit(1);
  }

  console.log('Found ' + stepFiles.length + ' STEP file(s):');
  stepFiles.forEach(f => console.log('  - ' + f));

  for (const stepFile of stepFiles) {
    const inputPath = join(projectRoot, stepFile);
    const safeName = stepFile
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.(step|stp)$/i, '.glb');
    const outputPath = join(outputDir, safeName);

    console.log('\nConverting: ' + stepFile);
    console.log('  Output: ' + safeName);

    try {
      const fileContent = new Uint8Array(readFileSync(inputPath));
      const result = occt.ReadStepFile(fileContent, null);

      console.log('  Meshes: ' + result.meshes.length);
      if (result.meshes.length === 0) {
        console.error('  No meshes found in STEP file!');
        continue;
      }

      const glb = buildGlb(result);
      writeFileSync(outputPath, glb);
      console.log('  Written: ' + outputPath + ' (' + (glb.length / 1024).toFixed(1) + ' KB)');
    } catch (err) {
      console.error('  Error converting ' + stepFile + ':', err.message);
    }
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
