import type { Side, CabinetSpec } from './types';

export interface FaceConfig {
  name: Side;
  normal: [number, number, number];
  uAxis: [number, number, number];
  vAxis: [number, number, number];
  center: [number, number, number];
  width: number;
  height: number;
  throughDepth: number;
}

/**
 * Resolve a named face into geometry for 3D rendering + hole shader.
 *
 * Body axes: width → X, height → Y, depth → Z.
 * uAxis = horizontal on the face, vAxis = vertical on the face.
 */
export function resolveFace(cab: CabinetSpec, face: Side): FaceConfig {
  const { w: width, h: height, d: depth } = cab;
  const [cx, cy, cz] = cab.bodyCenter ?? [0, 0, 0];

  const faces: Record<Side, { normal: [number,number,number]; uAxis: [number,number,number]; vAxis: [number,number,number]; w: number; h: number; td: number; off: [number,number,number] }> = {
    front:  { normal: [0,0,1],  uAxis: [1,0,0],  vAxis: [0,1,0],  w: width,  h: height, td: depth,  off: [0, 0, depth/2]  },
    back:   { normal: [0,0,-1], uAxis: [-1,0,0], vAxis: [0,1,0],  w: width,  h: height, td: depth,  off: [0, 0, -depth/2] },
    right:  { normal: [1,0,0],  uAxis: [0,0,-1], vAxis: [0,1,0],  w: depth,  h: height, td: width,  off: [width/2, 0, 0]  },
    left:   { normal: [-1,0,0], uAxis: [0,0,1],  vAxis: [0,1,0],  w: depth,  h: height, td: width,  off: [-width/2, 0, 0] },
    top:    { normal: [0,1,0],  uAxis: [1,0,0],  vAxis: [0,0,-1], w: width,  h: depth,  td: height, off: [0, height/2, 0] },
    bottom: { normal: [0,-1,0], uAxis: [1,0,0],  vAxis: [0,0,1],  w: width,  h: depth,  td: height, off: [0, -height/2, 0]},
  };

  const f = faces[face];
  return {
    name: face,
    normal: f.normal,
    uAxis: f.uAxis,
    vAxis: f.vAxis,
    center: [cx + f.off[0], cy + f.off[1], cz + f.off[2]],
    width: f.w,
    height: f.h,
    throughDepth: f.td,
  };
}
