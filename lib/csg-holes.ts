/**
 * CSG boolean subtraction — extrude 2D panel elements into 3D cutters
 * and subtract them from the cabinet mesh geometry.
 *
 * Uses three-bvh-csg for solid boolean operations.
 */

import type { FaceConfig } from './face-config';
import type { PanelElement } from './types';

/**
 * Build an array of cutter geometries (cylinders for holes, boxes for rects)
 * positioned correctly on the given face in world/scene space.
 */
export function buildCutterMeshes(
  THREE: typeof import('three'),
  Brush: any,
  elements: PanelElement[],
  fc: FaceConfig,
  panelW: number,
  panelH: number,
  cabToScene: number,
) {
  const cutters: InstanceType<typeof Brush>[] = [];
  const sw = (fc.width) / panelW;   // scale from panel mm → scene units
  const sh = (fc.height) / panelH;

  const faceCenter = new THREE.Vector3(...fc.center);
  const faceNormal = new THREE.Vector3(...fc.normal).normalize();
  const uAxis = new THREE.Vector3(...fc.uAxis).normalize();
  const vAxis = new THREE.Vector3(...fc.vAxis).normalize();

  // Through-depth: extrude cutters well past the wall for clean subtraction
  const depth = 60;  // generous depth to punch fully through any wall

  for (const el of elements) {
    if (el.type === 'hole' && el.diameter) {
      const radius = (el.diameter / 2) * Math.min(sw, sh);
      // Center of element in panel coords → face-local offset (centered, Y-flipped)
      const cx = (el.x + (el.w || 0) / 2) * sw - fc.width / 2;
      const cy = -((el.y + (el.h || 0) / 2) * sh - fc.height / 2);

      // Create cylinder aligned to face normal
      // We build geometry already oriented along Z, then rotate to face normal
      const geo = new THREE.CylinderGeometry(radius, radius, depth, 24);
      const brush = new Brush(geo);

      // Position: face center + offset along u/v axes
      // Center the cutter depth-wise on the face surface
      const pos = faceCenter.clone()
        .addScaledVector(uAxis, cx)
        .addScaledVector(vAxis, cy);

      brush.position.copy(pos);

      // Orient cylinder Y-axis along face normal
      const q = new THREE.Quaternion();
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), faceNormal);
      brush.quaternion.copy(q);

      brush.updateMatrixWorld(true);
      cutters.push(brush);

    } else if (el.type === 'rect') {
      const rw = el.w * sw;
      const rh = el.h * sh;
      const cx = (el.x + el.w / 2) * sw - fc.width / 2;
      const cy = -((el.y + el.h / 2) * sh - fc.height / 2);

      // Box: X=width along uAxis, Z=height along vAxis, Y=depth along normal
      const geo = new THREE.BoxGeometry(rw, depth, rh);
      const brush = new Brush(geo);

      const pos = faceCenter.clone()
        .addScaledVector(uAxis, cx)
        .addScaledVector(vAxis, cy);

      brush.position.copy(pos);

      // Orient: box X → uAxis, Y → normal, Z → vAxis
      const rotMatrix = new THREE.Matrix4().makeBasis(
        uAxis.clone(),
        faceNormal.clone(),
        vAxis.clone(),
      );
      brush.quaternion.setFromRotationMatrix(rotMatrix);

      brush.updateMatrixWorld(true);
      cutters.push(brush);
    }
  }

  return cutters;
}

/**
 * Apply CSG subtraction: subtract all cutter geometries from the base brush.
 * Returns the resulting Brush (which extends THREE.Mesh).
 *
 * If no cutters, returns null (caller should use original geometry).
 */
export function subtractCutters(
  evaluator: any,
  baseBrush: any,
  cutters: any[],
  SUBTRACTION: any,
): any | null {
  if (cutters.length === 0) return null;

  let result = baseBrush;
  for (const cutter of cutters) {
    result = evaluator.evaluate(result, cutter, SUBTRACTION);
  }
  return result;
}
