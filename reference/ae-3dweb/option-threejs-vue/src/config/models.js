/**
 * Model configuration registry.
 *
 * Each entry defines a cabinet model with:
 *   - file:   GLB file path
 *   - body:   known physical dimensions of the cabinet body (from datasheet)
 *   - bodyCenter: offset of the body center from the full model bbox center
 *              (accounts for open doors, handles, etc. shifting the bbox)
 *   - defaultFace: which face to edit ('front', 'back', 'left', 'right', 'top', 'bottom')
 *
 * The body axes map to 3D as:
 *   body.width  → X axis
 *   body.height → Y axis
 *   body.depth  → Z axis
 *
 * Face geometry (normal, center, panel size) is computed automatically
 * from body dimensions + bodyCenter by resolveFace().
 *
 * To configure a new model:
 *   1. Convert STEP → GLB: node scripts/convert-step.mjs
 *   2. Run: node scripts/detect-body.mjs <file.glb>
 *      Use the peak analysis to identify body walls and compute bodyCenter offset.
 *   3. Add an entry below with known dimensions + bodyCenter.
 */

const models = [
  {
    id: 'electrical_cabinet_520x350x170',
    label: 'Electrical Control Cabinet 520×350×170',
    file: '/models/Electrical_control_cabinet_No_2__520_x_350_x170.glb',

    // Known cabinet dimensions from product datasheet (mm)
    body: { width: 350, height: 520, depth: 170 },

    // Body center offset from full bbox center (in centered model coordinates).
    // Determined from detect-body.mjs peak analysis:
    //   X walls at -178 and 176 (raw) → body center X = -1, full bbox center X = 69.4 → offset = -70.4
    //   Y walls at -260 and 260 (raw) → body center Y = 0, full bbox center Y = 0 → offset = 0
    //   Z walls at 0 and 170 (raw)    → body center Z = 85, full bbox center Z = 206.9 → offset = -121.9
    bodyCenter: [-70, 0, -122],

    // Which face is editable: 'front' (+Z), 'back' (-Z), 'right' (+X), 'left' (-X), 'top' (+Y), 'bottom' (-Y)
    defaultFace: 'right',
  },
  {
    id: '12x16_enclosure',
    label: '12×16 Enclosure',
    file: '/models/12x16_Enclosure.glb',

    // Known dimensions (12"×16"→305×406mm, depth ~178mm from bbox analysis)
    body: { width: 472, height: 303, depth: 399 },

    // Full bbox center is the model center (no major outliers)
    bodyCenter: [0, 0, 0],

    defaultFace: 'right',
  },
];

/**
 * Resolve a named face into panel geometry for rendering + CSG.
 *
 * @param {Object} modelConfig - A model entry from the registry
 * @param {string} [faceName] - 'front'|'back'|'left'|'right'|'top'|'bottom' (default: modelConfig.defaultFace)
 * @returns {{ normal, uAxis, vAxis, center, width, height }}
 */
export function resolveFace(modelConfig, faceName) {
  const face = faceName || modelConfig.defaultFace;
  const { width, height, depth } = modelConfig.body;
  const [cx, cy, cz] = modelConfig.bodyCenter;

  // Face definitions: name → { normal, uAxis, vAxis, panelWidth, panelHeight, centerOffset }
  // uAxis = horizontal on the face, vAxis = vertical on the face
  const faces = {
    front:  { normal: [0,0,1],  uAxis: [1,0,0],  vAxis: [0,1,0],  w: width,  h: height, td: depth,  off: [0, 0, depth/2]  },
    back:   { normal: [0,0,-1], uAxis: [-1,0,0], vAxis: [0,1,0],  w: width,  h: height, td: depth,  off: [0, 0, -depth/2] },
    right:  { normal: [1,0,0],  uAxis: [0,0,-1], vAxis: [0,1,0],  w: depth,  h: height, td: width,  off: [width/2, 0, 0]  },
    left:   { normal: [-1,0,0], uAxis: [0,0,1],  vAxis: [0,1,0],  w: depth,  h: height, td: width,  off: [-width/2, 0, 0] },
    top:    { normal: [0,1,0],  uAxis: [1,0,0],  vAxis: [0,0,-1], w: width,  h: depth,  td: height, off: [0, height/2, 0] },
    bottom: { normal: [0,-1,0], uAxis: [1,0,0],  vAxis: [0,0,1],  w: width,  h: depth,  td: height, off: [0, -height/2, 0]},
  };

  const f = faces[face];
  if (!f) throw new Error(`Unknown face: "${face}". Use: ${Object.keys(faces).join(', ')}`);

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

export function getModelConfig(id) {
  return models.find(m => m.id === id);
}

export function getDefaultModel() {
  return models[0];
}

export { models };
