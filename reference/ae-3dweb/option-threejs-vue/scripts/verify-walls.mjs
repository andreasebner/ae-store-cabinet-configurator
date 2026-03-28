/**
 * Detect the body walls from vertex clusters to compute correct bodyCenter.
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
  model.position.sub(center);
  model.updateMatrixWorld(true);

  // Collect all vertex world positions
  const xs = [], ys = [], zs = [];
  model.traverse((child) => {
    if (!child.isMesh) return;
    const pos = child.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      v.applyMatrix4(child.matrixWorld);
      xs.push(v.x);
      ys.push(v.y);
      zs.push(v.z);
    }
  });

  // Find the major wall clusters using histogram peak detection
  function findPeaks(values, axis, binSize = 2) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = [];
    for (let b = min; b <= max; b += binSize) {
      const count = values.filter(v => v >= b && v < b + binSize).length;
      bins.push({ pos: b + binSize / 2, count });
    }
    // Sort by count, find the top peaks
    bins.sort((a, b) => b.count - a.count);
    const topPeaks = bins.slice(0, 10);
    console.log(`\n${axis} axis top peaks:`);
    topPeaks.forEach(p => console.log(`  ${axis}=${p.pos.toFixed(1)} count=${p.count}`));
    return topPeaks;
  }

  const xPeaks = findPeaks(xs, 'X');
  const yPeaks = findPeaks(ys, 'Y');
  const zPeaks = findPeaks(zs, 'Z');

  // The body walls are the two dominant X peaks (left/right), Y peaks (top/bottom), Z peaks (front/back)
  // For the body box:
  //   X: left wall and right wall -> body width
  //   Y: top and bottom -> body height  
  //   Z: front and back -> body depth

  // The two extreme high-count peaks on each axis are likely the body walls
  function wallPair(peaks) {
    const sorted = [...peaks].sort((a, b) => a.pos - b.pos);
    return { min: sorted[0].pos, max: sorted[sorted.length - 1].pos };
  }

  // More targeted: find the outermost peaks with significant vertex count
  function findWalls(values, axis) {
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    
    // Cluster vertices near the extremes
    const nearMin = values.filter(v => v < min + 10);
    const nearMax = values.filter(v => v > max - 10);
    
    // Find the mode (most common position) near each extreme
    function mode(vals, binSize = 1) {
      const bins = new Map();
      for (const v of vals) {
        const key = Math.round(v / binSize) * binSize;
        bins.set(key, (bins.get(key) || 0) + 1);
      }
      let bestKey = 0, bestCount = 0;
      for (const [k, c] of bins) {
        if (c > bestCount) { bestKey = k; bestCount = c; }
      }
      return bestKey;
    }
    
    const wallMin = mode(nearMin);
    const wallMax = mode(nearMax);
    console.log(`\n${axis} walls: ${wallMin.toFixed(1)} and ${wallMax.toFixed(1)} → span=${(wallMax-wallMin).toFixed(1)}, center=${((wallMin+wallMax)/2).toFixed(1)}`);
    return { min: wallMin, max: wallMax };
  }

  const xWalls = findWalls(xs, 'X');
  const yWalls = findWalls(ys, 'Y');  
  const zWalls = findWalls(zs, 'Z');

  const bodyCenter = [
    (xWalls.min + xWalls.max) / 2,
    (yWalls.min + yWalls.max) / 2,
    (zWalls.min + zWalls.max) / 2,
  ];

  console.log('\n=== CORRECT bodyCenter (centered coords) ===');
  console.log(`bodyCenter: [${bodyCenter.map(v => Math.round(v))}]`);
  console.log(`Body dimensions from walls:`);
  console.log(`  Width (X):  ${(xWalls.max - xWalls.min).toFixed(0)} mm (config: 350)`);
  console.log(`  Height (Y): ${(yWalls.max - yWalls.min).toFixed(0)} mm (config: 520)`);
  console.log(`  Depth (Z):  ${(zWalls.max - zWalls.min).toFixed(0)} mm (config: 170)`);

  // Compute correct face center for 'right' face
  const rightFaceCenter = [
    xWalls.max,
    bodyCenter[1],
    bodyCenter[2],
  ];
  console.log(`\nRight face center: [${rightFaceCenter.map(v => v.toFixed(1))}]`);
});
