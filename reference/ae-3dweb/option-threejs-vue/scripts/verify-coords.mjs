/**
 * Verify the actual vertex positions of the cabinet model after centering.
 * This tells us exactly where the right wall is in world coords, so we can
 * understand why the shader discard hits the wrong face.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { readFileSync } from 'fs';

const glbPath = 'public/models/Electrical_control_cabinet_No_2__520_x_350_x170.glb';
const buf = readFileSync(glbPath);
const arr = new Uint8Array(buf).buffer;

const loader = new GLTFLoader();
loader.parse(arr, '', (gltf) => {
  const model = gltf.scene;

  // Center model exactly as useThreeScene.js does
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  model.position.sub(center);
  model.updateMatrixWorld(true);

  console.log('Model bbox center (subtracted):', center.toArray().map(v => v.toFixed(1)));
  console.log('Model bbox size:', size.toArray().map(v => v.toFixed(1)));

  // Collect ALL vertex world positions
  const xs = [], ys = [], zs = [];
  const rightWallVerts = []; // vertices near the right wall (high X)
  const leftWallVerts = [];  // vertices near the left wall (low X)

  model.traverse((child) => {
    if (!child.isMesh) return;
    const geo = child.geometry;
    const pos = geo.attributes.position;
    const worldMatrix = child.matrixWorld;

    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      v.applyMatrix4(worldMatrix);
      xs.push(v.x);
      ys.push(v.y);
      zs.push(v.z);
    }
  });

  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  zs.sort((a, b) => a - b);

  console.log('\n--- Vertex ranges (world coords, after centering) ---');
  console.log(`X: [${xs[0].toFixed(2)}, ${xs[xs.length-1].toFixed(2)}]`);
  console.log(`Y: [${ys[0].toFixed(2)}, ${ys[ys.length-1].toFixed(2)}]`);
  console.log(`Z: [${zs[0].toFixed(2)}, ${zs[zs.length-1].toFixed(2)}]`);

  // Find clusters near the extremes (walls)
  const xMax = xs[xs.length - 1];
  const xMin = xs[0];

  // Right wall: vertices within 5mm of max X
  const rightX = xs.filter(x => x > xMax - 5);
  const leftX = xs.filter(x => x < xMin + 5);

  console.log(`\nRight wall cluster (X > ${(xMax-5).toFixed(1)}):`);
  console.log(`  Count: ${rightX.length} vertices`);
  console.log(`  Range: [${Math.min(...rightX).toFixed(2)}, ${Math.max(...rightX).toFixed(2)}]`);

  console.log(`\nLeft wall cluster (X < ${(xMin+5).toFixed(1)}):`);
  console.log(`  Count: ${leftX.length} vertices`);
  console.log(`  Range: [${Math.min(...leftX).toFixed(2)}, ${Math.max(...leftX).toFixed(2)}]`);

  // Compare with our config
  const bodyCenter = [-70, 0, -122];
  const bodyWidth = 350;
  const computedRightX = bodyCenter[0] + bodyWidth / 2;
  const computedLeftX = bodyCenter[0] - bodyWidth / 2;

  console.log('\n--- Config vs Reality ---');
  console.log(`Config face center X (right): ${computedRightX}`);
  console.log(`Actual right wall X: ${Math.max(...rightX).toFixed(2)}`);
  console.log(`Offset: ${(Math.max(...rightX) - computedRightX).toFixed(2)} mm`);
  console.log(`Config left wall X: ${computedLeftX}`);
  console.log(`Actual left wall X: ${Math.min(...leftX).toFixed(2)}`);
  console.log(`Offset: ${(Math.min(...leftX) - computedLeftX).toFixed(2)} mm`);

  // X histogram near the two walls
  console.log('\n--- X histogram (10mm bins at extremes) ---');
  for (let bin = xMin; bin < xMin + 20; bin += 2) {
    const count = xs.filter(x => x >= bin && x < bin + 2).length;
    if (count > 0) console.log(`  X [${bin.toFixed(0)}, ${(bin+2).toFixed(0)}): ${count}`);
  }
  console.log('  ...');
  for (let bin = xMax - 20; bin <= xMax; bin += 2) {
    const count = xs.filter(x => x >= bin && x < bin + 2).length;
    if (count > 0) console.log(`  X [${bin.toFixed(0)}, ${(bin+2).toFixed(0)}): ${count}`);
  }
});
