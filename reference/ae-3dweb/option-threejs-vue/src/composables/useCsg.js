import * as THREE from 'three';

const MAX_HOLES = 32;

/**
 * Build the face-local rotation quaternion for positioning objects on a face.
 */
function faceQuaternion(faceConfig) {
  const normal = new THREE.Vector3(...faceConfig.normal);
  const uAxis = new THREE.Vector3(...faceConfig.uAxis);
  const correctedV = new THREE.Vector3().crossVectors(normal, uAxis).normalize();
  const correctedU = new THREE.Vector3().crossVectors(correctedV, normal).normalize();
  const rotMatrix = new THREE.Matrix4().makeBasis(correctedU, correctedV, normal);
  return new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
}

/**
 * Create a wireframe rectangle frame showing the editable area on a face.
 */
export function createFrame(faceConfig) {
  const { width, height } = faceConfig;
  const normal = new THREE.Vector3(...faceConfig.normal);
  const center = new THREE.Vector3(...faceConfig.center);

  const hw = width / 2, hh = height / 2;
  const points = [
    new THREE.Vector3(-hw, -hh, 0),
    new THREE.Vector3( hw, -hh, 0),
    new THREE.Vector3( hw,  hh, 0),
    new THREE.Vector3(-hw,  hh, 0),
    new THREE.Vector3(-hw, -hh, 0),
  ];

  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: 0x00ccff, linewidth: 2, depthTest: true });
  const line = new THREE.Line(geom, mat);

  line.quaternion.copy(faceQuaternion(faceConfig));
  line.position.copy(center).addScaledVector(normal, 0.5);
  line.updateMatrixWorld(true);

  return line;
}

/**
 * Shader-based hole punch: discards cabinet fragments inside hole circles.
 *
 * Projects each fragment's 3D world position onto the face plane.
 * If the fragment is inside a hole circle AND within the body depth
 * range (inward from the face surface), it gets discarded.
 *
 * Depth range: up to +3mm outward (catches the wall surface with tolerance)
 *              up to -throughDepth-3mm inward (through the full body)
 * This means holes punch through the entire cabinet, but accessories
 * that protrude more than 3mm from the surface are untouched.
 */
export function createHoleShader(faceConfig) {
  const center = new THREE.Vector3(...faceConfig.center);
  const uAxis  = new THREE.Vector3(...faceConfig.uAxis);
  const vAxis  = new THREE.Vector3(...faceConfig.vAxis);
  const normal = new THREE.Vector3(...faceConfig.normal);
  const { width, height, throughDepth } = faceConfig;

  // Depth range: +3 outward (small tolerance for wall surface),
  // -(throughDepth+3) inward (full body + tolerance)
  const depthMax = 3.0;
  const depthMin = -(throughDepth + 3.0);

  const uniforms = {
    holeFaceCenter: { value: center },
    holeFaceUAxis:  { value: uAxis },
    holeFaceVAxis:  { value: vAxis },
    holeFaceNormal: { value: normal },
    holeDepthMin:   { value: depthMin },
    holeDepthMax:   { value: depthMax },
    holeCount:      { value: 0 },
    holeData:       { value: Array.from({ length: MAX_HOLES }, () => new THREE.Vector4()) },
  };

  function onBeforeCompile(shader) {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      '#include <common>\nvarying vec3 vHoleWorldPos;'
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
       vHoleWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
uniform vec3  holeFaceCenter;
uniform vec3  holeFaceUAxis;
uniform vec3  holeFaceVAxis;
uniform vec3  holeFaceNormal;
uniform float holeDepthMin;
uniform float holeDepthMax;
uniform int   holeCount;
uniform vec4  holeData[${MAX_HOLES}];
varying vec3  vHoleWorldPos;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <clipping_planes_fragment>',
      `#include <clipping_planes_fragment>
  {
    vec3  toFrag = vHoleWorldPos - holeFaceCenter;
    float hn     = dot(toFrag, holeFaceNormal);
    // Only test fragments within the body depth range
    if (hn >= holeDepthMin && hn <= holeDepthMax) {
      float hu = dot(toFrag, holeFaceUAxis);
      float hv = dot(toFrag, holeFaceVAxis);
      for (int i = 0; i < ${MAX_HOLES}; i++) {
        if (i >= holeCount) break;
        float dist = length(vec2(hu - holeData[i].x, hv - holeData[i].y));
        if (dist < holeData[i].z) discard;
      }
    }
  }`
    );
  }

  function updateHoles(holes) {
    uniforms.holeCount.value = Math.min(holes.length, MAX_HOLES);
    for (let i = 0; i < MAX_HOLES; i++) {
      if (i < holes.length) {
        const h = holes[i];
        const u = h.x - width / 2;
        const v = -(h.y - height / 2);
        uniforms.holeData.value[i].set(u, v, h.radius, 0);
      } else {
        uniforms.holeData.value[i].set(0, 0, 0, 0);
      }
    }
  }

  return { onBeforeCompile, updateHoles };
}
