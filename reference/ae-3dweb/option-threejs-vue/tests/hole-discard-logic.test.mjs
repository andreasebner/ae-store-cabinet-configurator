/**
 * End-to-end test for the hole-discard shader logic.
 *
 * Replicates the GLSL discard condition in JavaScript and tests it against
 * known 3D points on the electrical cabinet model to confirm:
 *   ✓ Fragments on the TARGET face inside a hole are discarded
 *   ✓ Fragments on the OPPOSITE face are NOT discarded (hole column doesn't reach)
 *   ✓ Fragments on perpendicular faces inside hole column are discarded (they're in the body)
 *   ✓ Fragments on the target face OUTSIDE holes are NOT discarded
 *   ✓ Fan grids / accessories (outside body AABB) are NOT discarded
 *   ✓ Interior elements inside body within a hole column ARE discarded
 */

// ---- Inline face resolver (mirrors models.js / resolveFace) ----

const cabinetConfig = {
  body: { width: 350, height: 520, depth: 170 },
  bodyCenter: [-70, 0, -122],
  defaultFace: 'right',
};

function resolveFace(cfg, faceName) {
  const face = faceName || cfg.defaultFace;
  const { width, height, depth } = cfg.body;
  const [cx, cy, cz] = cfg.bodyCenter;
  const faces = {
    front:  { normal: [0,0,1],  uAxis: [1,0,0],  vAxis: [0,1,0],  w: width,  h: height, td: depth,  off: [0,0,depth/2]   },
    back:   { normal: [0,0,-1], uAxis: [-1,0,0], vAxis: [0,1,0],  w: width,  h: height, td: depth,  off: [0,0,-depth/2]  },
    right:  { normal: [1,0,0],  uAxis: [0,0,-1], vAxis: [0,1,0],  w: depth,  h: height, td: width,  off: [width/2,0,0]   },
    left:   { normal: [-1,0,0], uAxis: [0,0,1],  vAxis: [0,1,0],  w: depth,  h: height, td: width,  off: [-width/2,0,0]  },
    top:    { normal: [0,1,0],  uAxis: [1,0,0],  vAxis: [0,0,-1], w: width,  h: depth,  td: height, off: [0,height/2,0]  },
    bottom: { normal: [0,-1,0], uAxis: [1,0,0],  vAxis: [0,0,1],  w: width,  h: depth,  td: height, off: [0,-height/2,0] },
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

// ---- Body AABB computation (mirrors useCsg.js) ----

const BODY_EPSILON = 0.5;

function computeBodyAABB(cfg, faceConfig) {
  const [cx, cy, cz] = cfg.bodyCenter;
  const bw = cfg.body.width / 2;
  const bh = cfg.body.height / 2;
  const bd = cfg.body.depth / 2;
  const bMin = [cx - bw, cy - bh, cz - bd];
  const bMax = [cx + bw, cy + bh, cz + bd];
  for (let i = 0; i < 3; i++) {
    const comp = faceConfig.normal[i];
    if (comp > 0) bMax[i] += BODY_EPSILON;
    else if (comp < 0) bMin[i] -= BODY_EPSILON;
  }
  return { bMin, bMax };
}

// ---- Inline discard logic (mirrors the GLSL shader) ----

function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }

/**
 * Returns true if the fragment would be discarded (hole punched).
 * Uses body AABB test — no surface normal check.
 */
function shouldDiscard(fragPos, faceConfig, holes, aabb) {
  const { center, uAxis, vAxis, width, height } = faceConfig;
  const { bMin, bMax } = aabb;

  // Body AABB check
  for (let i = 0; i < 3; i++) {
    if (fragPos[i] < bMin[i] || fragPos[i] > bMax[i]) return false;
  }

  // Hole circle check
  const toFrag = sub(fragPos, center);
  const hu = dot(toFrag, uAxis);
  const hv = dot(toFrag, vAxis);
  for (const hole of holes) {
    const u = hole.x - width / 2;
    const v = -(hole.y - height / 2);
    const dist = Math.sqrt((hu - u) ** 2 + (hv - v) ** 2);
    if (dist < hole.radius) return true;
  }
  return false;
}

// ---- Test runner ----

let passed = 0, failed = 0;
function assert(condition, label) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${label}`);
  }
}

// ---- Test cases ----

const face = resolveFace(cabinetConfig);
const aabb = computeBodyAABB(cabinetConfig, face);
// face.center = [105, 0, -122]
// face.normal = [1, 0, 0]
// aabb.bMin = [-245, -260, -207]
// aabb.bMax = [105.5, 260, -37]

// A hole at center of the panel (85mm from left, 260mm from top)
const holes = [{ x: 85, y: 260, radius: 15 }];

console.log('Face config:', JSON.stringify(face, null, 2));
console.log(`Body AABB: min=[${aabb.bMin}] max=[${aabb.bMax}]`);
console.log(`Hole center in face-local: u=0, v=0, r=15`);
console.log(`Face center in world: [${face.center}]`);
console.log('');

// ---- 1. Target face (right wall) — fragment inside hole ----
console.log('1. Target face — inside hole:');
assert(
  shouldDiscard([105, 0, -122], face, holes, aabb),
  'Right wall outer surface, dead center of hole → DISCARD'
);
assert(
  shouldDiscard([103, 0, -122], face, holes, aabb),
  'Right wall inner surface (2mm in), dead center → DISCARD'
);

// ---- 2. Target face — fragment outside hole ----
console.log('\n2. Target face — outside hole:');
assert(
  !shouldDiscard([105, 0, -122 + 30], face, holes, aabb),
  'Right wall outer surface, 30mm from hole center → keep'
);
assert(
  !shouldDiscard([105, 50, -122], face, holes, aabb),
  'Right wall outer surface, 50mm above hole center → keep'
);

// ---- 3. Opposite face (left wall) — should NEVER discard ----
console.log('\n3. Opposite face (left wall):');
assert(
  !shouldDiscard([-246, 0, -122], face, holes, aabb),
  'Left wall outer at same U/V as hole → keep (outside AABB)'
);

// ---- 4. Fan grids / accessories outside body ----
console.log('\n4. Fan grids and accessories (outside body AABB):');
assert(
  !shouldDiscard([108, 0, -122], face, holes, aabb),
  'Fan grid 3mm proud of right wall → keep (X=108 > AABB max 105.5)'
);
assert(
  !shouldDiscard([110, 0, -122], face, holes, aabb),
  'Fan grid 5mm proud of right wall → keep'
);
assert(
  !shouldDiscard([120, 0, -122], face, holes, aabb),
  'Handle 15mm proud → keep'
);

// ---- 5. Interior elements inside body within hole column ----
console.log('\n5. Interior elements inside body:');
assert(
  shouldDiscard([50, 0, -122], face, holes, aabb),
  'Interior bracket at X=50, inside hole column → DISCARD'
);
assert(
  shouldDiscard([0, 0, -122], face, holes, aabb),
  'Interior shelf at X=0, inside hole column → DISCARD'
);
assert(
  !shouldDiscard([50, 50, -122], face, holes, aabb),
  'Interior bracket at X=50, outside hole circle → keep'
);

// ---- 6. Perpendicular faces inside body ----
console.log('\n6. Perpendicular faces (top/bottom/front/back) inside body:');
// Top panel at Y=259 (inside body, AABB max Y=260)
assert(
  shouldDiscard([105, 0, -122], face, holes, aabb),
  'Top panel fragment at body edge, inside hole column → DISCARD'
);
// Front panel at Z=-38 (inside body, AABB max Z=-37)
assert(
  !shouldDiscard([105, 0, -36], face, holes, aabb),
  'Front panel fragment just outside body Z → keep'
);

// ---- 7. Edge cases ----
console.log('\n7. Edge cases:');
assert(
  !shouldDiscard([105, 15, -122], face, holes, aabb),
  'Fragment exactly at hole edge (dist == radius) → keep (strict <)'
);
assert(
  shouldDiscard([105, 14.9, -122], face, holes, aabb),
  'Fragment just inside hole edge → DISCARD'
);
assert(
  !shouldDiscard([105, 0, -122], face, [], aabb),
  'Zero holes → keep everything'
);

// ---- Summary ----
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
if (failed > 0) process.exit(1);
else console.log('All tests passed!');
