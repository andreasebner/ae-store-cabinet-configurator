'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { CABINETS, getPanelDimensions } from '@/lib/constants';
import { resolveFace, type FaceConfig } from '@/lib/face-config';
import { DEFAULT_OUTLINE_CONFIG, type PanelOutlineConfig } from '@/lib/panel-outline';
import { buildCutterMeshes, subtractCutters } from '@/lib/csg-holes';
import type { Side, PanelElement, CabinetSpec } from '@/lib/types';

/* ──────────────────────────────────────────────────────────────────── *
 *  Face quaternion — orient objects on a face
 * ──────────────────────────────────────────────────────────────────── */

function faceQuaternion(THREE: typeof import('three'), fc: FaceConfig) {
  const normal = new THREE.Vector3(...fc.normal);
  const uAxis  = new THREE.Vector3(...fc.uAxis);
  const correctedV = new THREE.Vector3().crossVectors(normal, uAxis).normalize();
  const correctedU = new THREE.Vector3().crossVectors(correctedV, normal).normalize();
  const rotMatrix  = new THREE.Matrix4().makeBasis(correctedU, correctedV, normal);
  return new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
}

function normalToSide(n: { x: number; y: number; z: number }): Side | null {
  const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
  if (ax > ay && ax > az) return n.x > 0 ? 'right' : 'left';
  if (ay > ax && ay > az) return n.y > 0 ? 'top' : 'bottom';
  if (az > ax && az > ay) return n.z > 0 ? 'front' : 'back';
  return null;
}

/* ──────────────────────────────────────────────────────────────────── *
 *  3D Panel Overlay — extruded zone meshes matching the 2D editor
 *
 *  Three layered meshes on the active face:
 *  1. Margin (non-cuttable edge strip) — slate, semi-transparent
 *  2. Exclusion zones (cross bars) — amber, semi-transparent
 *  3. Cuttable area — very faint cyan
 *  Cutout elements (holes, rects) are punched through via Shape.holes.
 * ──────────────────────────────────────────────────────────────────── */

const OVERLAY_DEPTH = 1.0; // scene units — thin slab

/** Create a THREE.Shape for a rounded rectangle (centered coords, Y-up). */
function roundedRectShape(
  THREE: typeof import('three'),
  x: number, y: number, w: number, h: number, r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Create a THREE.Path for a rounded rectangle (for use as a hole). */
function roundedRectHole(
  THREE: typeof import('three'),
  x: number, y: number, w: number, h: number, r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  const p = new THREE.Path();
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  return p;
}

/** Convert panel-space element to centered-coords cutout hole paths.
 *  Panel coords: Y-down, origin top-left (mm)
 *  Centered coords: Y-up, origin center (scene units) */
function elementCutoutHoles(
  THREE: typeof import('three'),
  elements: PanelElement[],
  pw: number, ph: number, scale: number,
) {
  const holes: InstanceType<typeof THREE.Path>[] = [];
  for (const el of elements) {
    if (el.type === 'hole' && el.diameter) {
      const cx = (el.x + (el.w || 0) / 2) * scale - (pw * scale) / 2;
      const cy = (ph - (el.y + (el.h || 0) / 2)) * scale - (ph * scale) / 2;
      const r = (el.diameter / 2) * scale;
      const p = new THREE.Path();
      p.absarc(cx, cy, r, 0, Math.PI * 2, false);
      holes.push(p);
    } else if (el.type === 'rect') {
      const sx = el.x * scale - (pw * scale) / 2;
      const sy = (ph - el.y - el.h) * scale - (ph * scale) / 2;
      const sw = el.w * scale;
      const sh = el.h * scale;
      const p = new THREE.Path();
      p.moveTo(sx, sy);
      p.lineTo(sx + sw, sy);
      p.lineTo(sx + sw, sy + sh);
      p.lineTo(sx, sy + sh);
      p.lineTo(sx, sy);
      holes.push(p);
    }
  }
  return holes;
}

/** Build the full 3D panel overlay group for one face. */
function buildPanelOverlay(
  THREE: typeof import('three'),
  fc: FaceConfig,
  pw: number, ph: number,
  outlineCfg: PanelOutlineConfig,
  elements: PanelElement[],
  cabToScene: number,
) {
  const group = new THREE.Group();
  const s = cabToScene; // shorthand
  const spw = pw * s; // scaled panel width
  const sph = ph * s; // scaled panel height
  const { cornerRadius: r, margin: m, crossBarWidth: bw, hasCrossH, hasCrossV } = outlineCfg;

  const extrudeSettings = { depth: OVERLAY_DEPTH, bevelEnabled: false };
  const cutouts = elementCutoutHoles(THREE, elements, pw, ph, s);

  // ── 1. Margin mesh (outer boundary minus cuttable area) ──
  const outerShape = roundedRectShape(THREE, -spw / 2, -sph / 2, spw, sph, r * s);
  const innerR = Math.max(0, (r - m) * s);
  const innerHole = roundedRectHole(
    THREE,
    -spw / 2 + m * s, -sph / 2 + m * s,
    spw - 2 * m * s, sph - 2 * m * s, innerR,
  );
  outerShape.holes.push(innerHole);
  // Punch cutouts through the margin too
  for (const h of cutouts) outerShape.holes.push(h);

  const marginGeo = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
  const marginMat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8, transparent: true, opacity: 0.45,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const marginMesh = new THREE.Mesh(marginGeo, marginMat);
  group.add(marginMesh);

  // ── 2. Exclusion zones (cross bars) ──
  if (hasCrossH || hasCrossV) {
    const cx = 0; // center
    const cy = 0;
    const halfBw = (bw * s) / 2;
    const innerLeft = -spw / 2 + m * s;
    const innerRight = spw / 2 - m * s;
    const innerBottom = -sph / 2 + m * s;
    const innerTop = sph / 2 - m * s;

    // Build the cross shape
    let exclShape: InstanceType<typeof THREE.Shape>;
    if (hasCrossH && hasCrossV) {
      // Combined cross shape: vertical bar full height, horizontal bar added
      exclShape = new THREE.Shape();
      // Start at top-left of vertical bar, go clockwise with notches for horizontal
      exclShape.moveTo(cx - halfBw, innerTop);
      exclShape.lineTo(cx + halfBw, innerTop);
      exclShape.lineTo(cx + halfBw, cy + halfBw);
      exclShape.lineTo(innerRight, cy + halfBw);
      exclShape.lineTo(innerRight, cy - halfBw);
      exclShape.lineTo(cx + halfBw, cy - halfBw);
      exclShape.lineTo(cx + halfBw, innerBottom);
      exclShape.lineTo(cx - halfBw, innerBottom);
      exclShape.lineTo(cx - halfBw, cy - halfBw);
      exclShape.lineTo(innerLeft, cy - halfBw);
      exclShape.lineTo(innerLeft, cy + halfBw);
      exclShape.lineTo(cx - halfBw, cy + halfBw);
      exclShape.closePath();
    } else if (hasCrossV) {
      exclShape = new THREE.Shape();
      exclShape.moveTo(cx - halfBw, innerBottom);
      exclShape.lineTo(cx + halfBw, innerBottom);
      exclShape.lineTo(cx + halfBw, innerTop);
      exclShape.lineTo(cx - halfBw, innerTop);
      exclShape.closePath();
    } else {
      exclShape = new THREE.Shape();
      exclShape.moveTo(innerLeft, cy - halfBw);
      exclShape.lineTo(innerRight, cy - halfBw);
      exclShape.lineTo(innerRight, cy + halfBw);
      exclShape.lineTo(innerLeft, cy + halfBw);
      exclShape.closePath();
    }

    // Punch cutouts through exclusion zones
    for (const h of cutouts) exclShape.holes.push(h);

    const exclGeo = new THREE.ExtrudeGeometry(exclShape, extrudeSettings);
    const exclMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, transparent: true, opacity: 0.35,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const exclMesh = new THREE.Mesh(exclGeo, exclMat);
    group.add(exclMesh);
  }

  // ── 3. Cuttable area (subtle tint) ──
  const cuttableShape = roundedRectShape(
    THREE,
    -spw / 2 + m * s, -sph / 2 + m * s,
    spw - 2 * m * s, sph - 2 * m * s, innerR,
  );
  // Subtract exclusion zones from cuttable area
  if (hasCrossH || hasCrossV) {
    const cx = 0;
    const cy = 0;
    const halfBw = (bw * s) / 2;
    const innerLeft = -spw / 2 + m * s;
    const innerRight = spw / 2 - m * s;
    const innerBottom = -sph / 2 + m * s;
    const innerTop = sph / 2 - m * s;

    if (hasCrossH && hasCrossV) {
      // Subtract entire cross as one hole
      const ch = new THREE.Path();
      ch.moveTo(cx - halfBw, innerTop);
      ch.lineTo(cx + halfBw, innerTop);
      ch.lineTo(cx + halfBw, cy + halfBw);
      ch.lineTo(innerRight, cy + halfBw);
      ch.lineTo(innerRight, cy - halfBw);
      ch.lineTo(cx + halfBw, cy - halfBw);
      ch.lineTo(cx + halfBw, innerBottom);
      ch.lineTo(cx - halfBw, innerBottom);
      ch.lineTo(cx - halfBw, cy - halfBw);
      ch.lineTo(innerLeft, cy - halfBw);
      ch.lineTo(innerLeft, cy + halfBw);
      ch.lineTo(cx - halfBw, cy + halfBw);
      cuttableShape.holes.push(ch);
    } else if (hasCrossV) {
      const ch = new THREE.Path();
      ch.moveTo(cx - halfBw, innerBottom);
      ch.lineTo(cx + halfBw, innerBottom);
      ch.lineTo(cx + halfBw, innerTop);
      ch.lineTo(cx - halfBw, innerTop);
      cuttableShape.holes.push(ch);
    } else {
      const ch = new THREE.Path();
      ch.moveTo(innerLeft, cy - halfBw);
      ch.lineTo(innerRight, cy - halfBw);
      ch.lineTo(innerRight, cy + halfBw);
      ch.lineTo(innerLeft, cy + halfBw);
      cuttableShape.holes.push(ch);
    }
  }
  // Punch element cutouts through cuttable area
  for (const h of cutouts) cuttableShape.holes.push(h);

  const cuttableGeo = new THREE.ExtrudeGeometry(cuttableShape, extrudeSettings);
  const cuttableMat = new THREE.MeshBasicMaterial({
    color: 0x00ccff, transparent: true, opacity: 0.08,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const cuttableMesh = new THREE.Mesh(cuttableGeo, cuttableMat);
  group.add(cuttableMesh);

  // ── 4. Boundary outline (wireframe edge) ──
  const hw = spw / 2, hh = sph / 2;
  const outlinePts = [
    new THREE.Vector3(-hw, -hh, OVERLAY_DEPTH + 0.1),
    new THREE.Vector3( hw, -hh, OVERLAY_DEPTH + 0.1),
    new THREE.Vector3( hw,  hh, OVERLAY_DEPTH + 0.1),
    new THREE.Vector3(-hw,  hh, OVERLAY_DEPTH + 0.1),
    new THREE.Vector3(-hw, -hh, OVERLAY_DEPTH + 0.1),
  ];
  const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePts);
  const outlineMat = new THREE.LineBasicMaterial({ color: 0x00ccff, linewidth: 2 });
  group.add(new THREE.Line(outlineGeo, outlineMat));

  // ── 5. Orient and position on face ──
  group.quaternion.copy(faceQuaternion(THREE, fc));
  const center = new THREE.Vector3(...fc.center);
  const normal = new THREE.Vector3(...fc.normal);
  group.position.copy(center).addScaledVector(normal, 0.5);

  return group;
}

/** Dispose all children geometries and materials in a group. */
function disposeGroup(group: any) {
  group.traverse((child: any) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
      else child.material.dispose();
    }
  });
}

/* ──────────────────────────────────────────────────────────────────── *
 *  Component
 * ──────────────────────────────────────────────────────────────────── */

export default function Cabinet3DScene() {
  const [loading, setLoading] = useState(true);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const threeRef        = useRef<typeof import('three') | null>(null);
  const rendererRef     = useRef<any>(null);
  const sceneRef        = useRef<any>(null);
  const cameraRef       = useRef<any>(null);
  const controlsRef     = useRef<any>(null);
  const modelRootRef    = useRef<any>(null);
  const overlayGroupRef = useRef<any>(null);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickBoxRef      = useRef<any>(null);
  const loadedUrlRef    = useRef<string | null>(null);
  const modelDimsRef    = useRef<{ w: number; h: number; d: number } | null>(null);
  const cabToSceneRef   = useRef<number>(1);
  const rafRef          = useRef<number>(0);
  const disposedRef     = useRef(false);

  // CSG-related refs
  const originalGeosRef = useRef<Map<any, any>>(new Map()); // mesh → original BufferGeometry clone
  const csgEvaluatorRef = useRef<any>(null);
  const csgBrushRef     = useRef<any>(null); // Brush constructor
  const csgSubRef       = useRef<any>(null); // SUBTRACTION constant
  const csgTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyMaterialRef = useRef<any>(null);
  const bodyMeshesRef   = useRef<any[]>([]); // all body meshes (non-door)

  // Debug mode refs
  const debugHelpersRef = useRef<any>(null); // Group containing debug objects
  const debugPointRef   = useRef<any>(null); // draggable sphere
  const dragControlsRef = useRef<any>(null);

  const { currentCabinet, currentSide, sideElements } = useConfiguratorStore();
  const debugMode = useConfiguratorStore(s => s.debugMode);
  const debugPoint = useConfiguratorStore(s => s.debugPoint);
  const setDebugPoint = useConfiguratorStore(s => s.setDebugPoint);
  const toggleDebugMode = useConfiguratorStore(s => s.toggleDebugMode);
  const cab = CABINETS[currentCabinet];

  // Local state for debug coordinate display
  const [debugCoords, setDebugCoords] = useState<[number, number, number]>([0, 0, 0]);

  /** Build a CabinetSpec-compatible object from the loaded model's actual dimensions. */
  const getModelSpec = useCallback((): CabinetSpec => {
    const d = modelDimsRef.current;
    if (d) return { name: '', w: d.w, h: d.h, d: d.d, basePrice: 0, description: '', bodyCenter: [0, 0, 0] };
    return cab;
  }, [cab]);

  /** Face config with cabinet-spec proportions (uniform scale, no aspect distortion).
   *  Center/normal/axes come from the model mesh (correct 3D position),
   *  but width/height come from the cabinet spec (correct panel proportions). */
  const getPanelFaceConfig = useCallback((side: Side): FaceConfig => {
    const mc = getModelSpec();
    const fc = resolveFace(mc, side);
    const scale = cabToSceneRef.current;
    const { pw, ph } = getPanelDimensions(currentCabinet, side);
    return { ...fc, width: pw * scale, height: ph * scale };
  }, [currentCabinet, getModelSpec]);

  /* ── Camera: position for a specific face ── */
  const positionCamera = useCallback((THREE: typeof import('three'), fc: FaceConfig) => {
    const cam = cameraRef.current;
    const ctl = controlsRef.current;
    if (!cam || !ctl) return;

    const faceNormal = new THREE.Vector3(...fc.normal);
    const faceCenter = new THREE.Vector3(...fc.center);
    const maxDim = Math.max(fc.width, fc.height) * 1.8;

    cam.position.set(
      faceCenter.x + faceNormal.x * maxDim + maxDim * 0.3,
      faceCenter.y + maxDim * 0.25,
      faceCenter.z + faceNormal.z * maxDim + maxDim * 0.3,
    );
    ctl.target.copy(faceCenter);
    ctl.update();
  }, []);

  /* ── Camera: "home" isometric view showing front, top, right ── */
  const resetCameraToHome = useCallback((THREE: typeof import('three'), fc?: FaceConfig) => {
    const cam = cameraRef.current;
    const ctl = controlsRef.current;
    const dims = modelDimsRef.current;
    if (!cam || !ctl) return;

    // Use provided face config or derive from current state
    const d = dims ?? { w: 500, h: 500, d: 500 };
    const maxDim = Math.max(d.w, d.h, d.d);
    const dist = maxDim * 2.2;

    // Isometric-ish angle: slightly right, slightly above, slightly in front
    cam.position.set(dist * 0.7, dist * 0.5, dist * 0.8);
    ctl.target.set(0, 0, 0);
    ctl.update();
  }, []);

  /* ── Panel overlay — extruded 2D panel zones on the active face ── */
  const updatePanelOverlay = useCallback((THREE: typeof import('three'), fc: FaceConfig, immediate?: boolean) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const rebuild = () => {
      // Dispose old overlay
      if (overlayGroupRef.current) {
        scene.remove(overlayGroupRef.current);
        disposeGroup(overlayGroupRef.current);
        overlayGroupRef.current = null;
      }

      const store = useConfiguratorStore.getState();
      const side = store.currentSide;
      const elements = store.sideElements[side] || [];
      const { pw, ph } = getPanelDimensions(store.currentCabinet, side);
      const cab = CABINETS[store.currentCabinet];
      const outlineCfg: PanelOutlineConfig = {
        ...DEFAULT_OUTLINE_CONFIG,
        ...cab.outlineConfig,
        ...cab.sideOutlineOverrides?.[side],
      };
      const scale = cabToSceneRef.current;

      const overlay = buildPanelOverlay(THREE, fc, pw, ph, outlineCfg, elements, scale);
      scene.add(overlay);
      overlayGroupRef.current = overlay;
    };

    if (immediate) {
      rebuild();
    } else {
      // Debounce during rapid updates (e.g. dragging elements)
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = setTimeout(rebuild, 80);
    }
  }, []);

  /* ── Apply CSG boolean subtraction — extrude 2D cuts and subtract from mesh ── */
  const applyCsgCutouts = useCallback((fc: FaceConfig, immediate?: boolean) => {
    const T = threeRef.current;
    const evaluator = csgEvaluatorRef.current;
    const BrushCls = csgBrushRef.current;
    const SUB = csgSubRef.current;
    if (!T || !evaluator || !BrushCls || !SUB) return;

    const rebuild = () => {
      const store = useConfiguratorStore.getState();
      const side = store.currentSide;
      const elements = store.sideElements[side] || [];
      const { pw, ph } = getPanelDimensions(store.currentCabinet, side);
      const scale = cabToSceneRef.current;

      // Use raw FaceConfig (model-space, not panel-scaled) for positioning cutters
      const mc = getModelSpec();
      const rawFc = resolveFace(mc, side);
      const panelFc: FaceConfig = { ...rawFc, width: pw * scale, height: ph * scale };

      // Build cutter geometries for this side's elements (in world/scene space)
      const cutters = buildCutterMeshes(T, BrushCls, elements, panelFc, pw, ph, scale);

      // For each body mesh: restore original geometry, then subtract cutters
      for (const mesh of bodyMeshesRef.current) {
        const origGeo = originalGeosRef.current.get(mesh);
        if (!origGeo) continue;

        if (cutters.length === 0) {
          // No elements → restore original geometry
          if (mesh.geometry !== origGeo) {
            mesh.geometry.dispose();
            mesh.geometry = origGeo.clone();
          }
          continue;
        }

        try {
          // The mesh geometry is in local space but cutters are in world space.
          // Bake the mesh's world transform into a cloned geometry so CSG
          // operates in a consistent (world) coordinate frame.
          mesh.updateMatrixWorld(true);
          const worldGeo = origGeo.clone();
          worldGeo.applyMatrix4(mesh.matrixWorld);

          const baseBrush = new BrushCls(worldGeo);
          baseBrush.updateMatrixWorld(true);

          const result = subtractCutters(evaluator, baseBrush, cutters, SUB);
          if (result) {
            // Convert result back to the mesh's local space
            const invMatrix = mesh.matrixWorld.clone().invert();
            result.geometry.applyMatrix4(invMatrix);

            mesh.geometry.dispose();
            mesh.geometry = result.geometry;
          }
        } catch (err) {
          console.warn('[CSG] Subtraction failed, keeping original:', err);
        }
      }
    };

    if (immediate) {
      rebuild();
    } else {
      if (csgTimerRef.current) clearTimeout(csgTimerRef.current);
      csgTimerRef.current = setTimeout(rebuild, 100);
    }
  }, [getModelSpec]);

  /* ── Init Three.js scene (runs once) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    disposedRef.current = false;

    let cleanupFn: (() => void) | undefined;

    (async () => {
      const THREE = await import('three');
      if (disposedRef.current) return;
      threeRef.current = THREE;

      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
      if (disposedRef.current) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xd4d4d8);
      sceneRef.current = scene;

      const container = canvas.parentElement!;
      const aspect = container.clientWidth / container.clientHeight || 1;
      const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 10000);
      camera.position.set(0, 200, 800);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      rendererRef.current = renderer;

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controlsRef.current = controls;

      // Lighting (matching ae-3dweb)
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const d1 = new THREE.DirectionalLight(0xffffff, 0.8);
      d1.position.set(200, 300, 400);
      scene.add(d1);
      const d2 = new THREE.DirectionalLight(0xffffff, 0.3);
      d2.position.set(-200, -100, -200);
      scene.add(d2);

      function animate() {
        if (disposedRef.current) return;
        rafRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        }
      });
      ro.observe(container);

      cleanupFn = () => {
        ro.disconnect();
        controls.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposedRef.current = true;
      cancelAnimationFrame(rafRef.current);
      cleanupFn?.();
    };
  }, []);

  /* ── Load GLB model when cabinet changes ── */
  useEffect(() => {
    const url = cab.modelUrl;
    if (!url) return;
    if (loadedUrlRef.current === url) return;
    setLoading(true);

    (async () => {
      // Wait for Three.js init (from the scene-init effect) — poll instead of fixed delay
      for (let i = 0; i < 40; i++) {
        if (threeRef.current && sceneRef.current) break;
        await new Promise(r => setTimeout(r, 100));
        if (disposedRef.current) return;
      }
      const T = threeRef.current;
      const scene = sceneRef.current;
      if (!T || !scene) { setLoading(false); return; }

      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      if (disposedRef.current) return;

      // Import CSG library
      const { Brush, Evaluator, HOLLOW_SUBTRACTION } = await import('three-bvh-csg');
      csgBrushRef.current = Brush;
      csgSubRef.current = HOLLOW_SUBTRACTION;
      const evaluator = new Evaluator();
      evaluator.attributes = ['position', 'normal'];
      csgEvaluatorRef.current = evaluator;

      // Dispose old model
      if (modelRootRef.current) {
        scene.remove(modelRootRef.current);
        modelRootRef.current = null;
      }
      if (pickBoxRef.current) {
        scene.remove(pickBoxRef.current);
        pickBoxRef.current = null;
      }

      const loader = new GLTFLoader();
      loader.load(url, (gltf) => {
        if (disposedRef.current) return;
        const model = gltf.scene;

        // 1) Apply configured rotation FIRST (e.g. -π/2 X to make Z→Y for vertical height)
        const [rx, ry, rz] = cab.modelRotation ?? [0, 0, 0];
        if (rx || ry || rz) {
          model.rotation.set(rx, ry, rz);
          model.updateMatrixWorld(true);
        }

        // 2) Find body mesh for centering/sizing (if configured)
        let bodyBox: InstanceType<typeof T.Box3> | null = null;
        if (cab.bodyMeshName) {
          model.traverse((child: any) => {
            if (child.name === cab.bodyMeshName && !bodyBox) {
              bodyBox = new T.Box3().setFromObject(child);
            }
          });
        }

        // Fall back to full model bbox if no body mesh found
        const refBox = bodyBox ?? new T.Box3().setFromObject(model);
        const refCenter = refBox.getCenter(new T.Vector3());
        const refSize = refBox.getSize(new T.Vector3());

        // 3) Center model so the BODY is at origin (not full model including open door)
        model.position.sub(refCenter);

        // 4) Uniform scale based on body dimensions
        const maxDim = Math.max(refSize.x, refSize.y, refSize.z);
        const uniformScale = 500 / maxDim;

        const root = new T.Group();
        root.add(model);
        root.scale.setScalar(uniformScale);
        modelRootRef.current = root;

        // 5) Store body dimensions in scene space (not full model dims)
        const mw = refSize.x * uniformScale;
        const mh = refSize.y * uniformScale;
        const md = refSize.z * uniformScale;
        modelDimsRef.current = { w: mw, h: mh, d: md };

        // Uniform scale from cabinet-spec mm → scene mm (fit panel within model face)
        const cabToScene = Math.min(mw / cab.w, mh / cab.h, md / cab.d);
        cabToSceneRef.current = cabToScene;

        // Face config from body dims
        const store = useConfiguratorStore.getState();
        const modelSpec: CabinetSpec = { name: '', w: mw, h: mh, d: md, basePrice: 0, description: '', bodyCenter: [0, 0, 0] };
        const fc = resolveFace(modelSpec, store.currentSide);

        // Panel face config with cabinet-spec proportions for overlay + CSG
        const { pw, ph } = getPanelDimensions(store.currentCabinet, store.currentSide);
        const panelFc: FaceConfig = { ...fc, width: pw * cabToScene, height: ph * cabToScene };

        // Plain material — no shader plugin needed; CSG handles hole geometry
        const mat = new T.MeshStandardMaterial({
          color: 0x8899aa,
          metalness: 0.3,
          roughness: 0.6,
          side: T.DoubleSide,
        });
        bodyMaterialRef.current = mat;

        // Transparent material for the door panel(s)
        const doorMat = new T.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0.0,
          roughness: 0.05,
          transmission: 0.92,
          thickness: 3.0,
          ior: 1.45,
          transparent: true,
          opacity: 0.35,
          envMapIntensity: 0.4,
          side: T.DoubleSide,
        });
        const doorNames = new Set(cab.doorMeshNames ?? []);

        // Store original geometries and collect body meshes for CSG
        originalGeosRef.current.clear();
        bodyMeshesRef.current = [];

        model.traverse((child: any) => {
          if (child.isMesh) {
            const isDoor = doorNames.has(child.name);
            child.material = isDoor ? doorMat : mat;
            if (!isDoor) {
              // Clone and store original geometry for CSG restoration
              originalGeosRef.current.set(child, child.geometry.clone());
              bodyMeshesRef.current.push(child);
            }
          }
        });

        scene.add(root);
        loadedUrlRef.current = url;

        // Invisible pick box for face-click detection (matches body dims)
        const boxGeo = new T.BoxGeometry(mw, mh, md);
        const boxMat = new T.MeshBasicMaterial({ visible: false });
        const pickBox = new T.Mesh(boxGeo, boxMat);
        scene.add(pickBox);
        pickBoxRef.current = pickBox;

        // Position camera to home view, show overlay, apply CSG cutouts
        resetCameraToHome(T, fc);
        updatePanelOverlay(T, panelFc, true);
        applyCsgCutouts(panelFc, true);

        setLoading(false);
        console.log('[3D] Model loaded, body dims:', mw.toFixed(0), mh.toFixed(0), md.toFixed(0), 'scale:', uniformScale.toFixed(3));
      }, undefined, (err: any) => {
        console.warn('Failed to load GLB model:', err);
        setLoading(false);
      });
    })();
  }, [cab.modelUrl, cab, getModelSpec, resetCameraToHome, positionCamera, updatePanelOverlay, applyCsgCutouts]);

  /* ── Update overlay + camera + CSG when side changes ── */
  useEffect(() => {
    const T = threeRef.current;
    if (!T || !sceneRef.current) return;
    const mc = getModelSpec();
    const fc = resolveFace(mc, currentSide);
    const panelFc = getPanelFaceConfig(currentSide);

    positionCamera(T, fc);
    updatePanelOverlay(T, panelFc, true);
    applyCsgCutouts(panelFc, true);
  }, [currentSide, getModelSpec, getPanelFaceConfig, positionCamera, updatePanelOverlay, applyCsgCutouts]);

  /* ── Re-apply CSG + overlay when 2D elements change ── */
  useEffect(() => {
    const T = threeRef.current;
    const panelFc = getPanelFaceConfig(currentSide);
    applyCsgCutouts(panelFc);
    // Rebuild overlay (debounced) so cutout holes update in the zone meshes
    if (T) updatePanelOverlay(T, panelFc);
  }, [sideElements, currentSide, getPanelFaceConfig, applyCsgCutouts, updatePanelOverlay]);

  /* ── Face click via raycasting — only on true clicks (no drag) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let downX = 0;
    let downY = 0;
    const DRAG_THRESHOLD = 5; // px — movement beyond this = drag, not click

    function onMouseDown(e: MouseEvent) {
      downX = e.clientX;
      downY = e.clientY;
    }

    function onMouseUp(e: MouseEvent) {
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) return; // was a drag

      const T = threeRef.current;
      const cam = cameraRef.current;
      const box = pickBoxRef.current;
      if (!T || !cam || !box) return;

      const store = useConfiguratorStore.getState();
      const disabledSides = new Set(CABINETS[store.currentCabinet].disabledSides ?? []);

      const rect = canvas!.getBoundingClientRect();
      const mouse = new T.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );

      const raycaster = new T.Raycaster();
      raycaster.setFromCamera(mouse, cam);
      const hits = raycaster.intersectObject(box);
      if (hits.length === 0 || !hits[0].face) return;

      const side = normalToSide(hits[0].face.normal);
      if (side && !disabledSides.has(side)) store.setSide(side);
    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleHomeView = useCallback(() => {
    const T = threeRef.current;
    if (T) resetCameraToHome(T);
  }, [resetCameraToHome]);

  /* ── Debug mode: create/remove helpers, anchor markers, and draggable point ── */
  useEffect(() => {
    const T = threeRef.current;
    const scene = sceneRef.current;
    const cam = cameraRef.current;
    const canvas = canvasRef.current;
    if (!T || !scene || !cam || !canvas) return;

    // Cleanup previous debug objects
    if (debugHelpersRef.current) {
      scene.remove(debugHelpersRef.current);
      disposeGroup(debugHelpersRef.current);
      debugHelpersRef.current = null;
    }
    if (dragControlsRef.current) {
      dragControlsRef.current.dispose();
      dragControlsRef.current = null;
    }

    if (!debugMode) return;

    const dims = modelDimsRef.current ?? { w: 500, h: 500, d: 500 };
    const maxDim = Math.max(dims.w, dims.h, dims.d);
    const group = new T.Group();

    // -- Axes helper (RGB lines at origin)
    const axes = new T.AxesHelper(maxDim * 0.8);
    group.add(axes);

    // -- Grid helper on XZ plane
    const gridSize = Math.ceil(maxDim / 50) * 50;
    const grid = new T.GridHelper(gridSize * 2, gridSize / 25, 0x666666, 0xcccccc);
    grid.position.y = -dims.h / 2;
    group.add(grid);

    // -- Anchor point markers for current face
    const mc = getModelSpec();
    const fc = resolveFace(mc, currentSide);
    const scale = cabToSceneRef.current;
    const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);
    const panelFc: FaceConfig = { ...fc, width: pw * scale, height: ph * scale };

    const faceCenter = new T.Vector3(...panelFc.center);
    const uAxis = new T.Vector3(...panelFc.uAxis);
    const vAxis = new T.Vector3(...panelFc.vAxis);
    const normal = new T.Vector3(...panelFc.normal);
    const hw = panelFc.width / 2;
    const hh = panelFc.height / 2;

    // Anchor positions: center + 4 corners
    const anchorPositions = [
      { label: 'Center', pos: faceCenter.clone() },
      { label: 'TL', pos: faceCenter.clone().addScaledVector(uAxis, -hw).addScaledVector(vAxis, hh) },
      { label: 'TR', pos: faceCenter.clone().addScaledVector(uAxis, hw).addScaledVector(vAxis, hh) },
      { label: 'BL', pos: faceCenter.clone().addScaledVector(uAxis, -hw).addScaledVector(vAxis, -hh) },
      { label: 'BR', pos: faceCenter.clone().addScaledVector(uAxis, hw).addScaledVector(vAxis, -hh) },
    ];

    const markerGeo = new T.SphereGeometry(maxDim * 0.012, 16, 16);
    const markerMat = new T.MeshBasicMaterial({ color: 0x22c55e, depthTest: false });
    const centerMat = new T.MeshBasicMaterial({ color: 0x3b82f6, depthTest: false });

    for (const anchor of anchorPositions) {
      const sphere = new T.Mesh(markerGeo, anchor.label === 'Center' ? centerMat : markerMat);
      sphere.position.copy(anchor.pos).addScaledVector(normal, 1.0);
      sphere.renderOrder = 999;
      group.add(sphere);

      // Coordinate label sprite
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const ctx = labelCanvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.roundRect(0, 0, 256, 64, 6);
      ctx.fill();
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${anchor.label}`, 8, 22);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#a5f3fc';
      const p = anchor.pos;
      ctx.fillText(`${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}`, 8, 48);

      const tex = new T.CanvasTexture(labelCanvas);
      const spriteMat = new T.SpriteMaterial({ map: tex, depthTest: false });
      const sprite = new T.Sprite(spriteMat);
      sprite.position.copy(anchor.pos).addScaledVector(normal, 1.5).addScaledVector(vAxis, maxDim * 0.035);
      sprite.scale.set(maxDim * 0.18, maxDim * 0.045, 1);
      sprite.renderOrder = 999;
      group.add(sprite);
    }

    // -- Face info: draw edges of current face panel
    const edgePts = [
      faceCenter.clone().addScaledVector(uAxis, -hw).addScaledVector(vAxis, -hh).addScaledVector(normal, 1.2),
      faceCenter.clone().addScaledVector(uAxis, hw).addScaledVector(vAxis, -hh).addScaledVector(normal, 1.2),
      faceCenter.clone().addScaledVector(uAxis, hw).addScaledVector(vAxis, hh).addScaledVector(normal, 1.2),
      faceCenter.clone().addScaledVector(uAxis, -hw).addScaledVector(vAxis, hh).addScaledVector(normal, 1.2),
      faceCenter.clone().addScaledVector(uAxis, -hw).addScaledVector(vAxis, -hh).addScaledVector(normal, 1.2),
    ];
    const edgeGeo = new T.BufferGeometry().setFromPoints(edgePts);
    const edgeLine = new T.Line(edgeGeo, new T.LineBasicMaterial({ color: 0x22c55e, linewidth: 2, depthTest: false }));
    edgeLine.renderOrder = 999;
    group.add(edgeLine);

    // -- Overlay anchor point (where the 2D panel overlay is placed on the face)
    const overlayAnchor = faceCenter.clone().addScaledVector(normal, 0.5);
    const oaGeo = new T.SphereGeometry(maxDim * 0.015, 12, 12);
    const oaMat = new T.MeshBasicMaterial({ color: 0xd946ef, depthTest: false }); // magenta
    const oaMesh = new T.Mesh(oaGeo, oaMat);
    oaMesh.position.copy(overlayAnchor);
    oaMesh.renderOrder = 999;
    group.add(oaMesh);

    // Overlay anchor label
    const oaCanvas = document.createElement('canvas');
    oaCanvas.width = 320;
    oaCanvas.height = 48;
    const oaCtx = oaCanvas.getContext('2d')!;
    oaCtx.fillStyle = 'rgba(217,70,239,0.85)';
    oaCtx.roundRect(0, 0, 320, 48, 6);
    oaCtx.fill();
    oaCtx.font = 'bold 18px monospace';
    oaCtx.fillStyle = '#fff';
    oaCtx.fillText('Overlay Anchor', 8, 20);
    oaCtx.font = '14px monospace';
    oaCtx.fillStyle = '#fce7f3';
    oaCtx.fillText(`${overlayAnchor.x.toFixed(1)}, ${overlayAnchor.y.toFixed(1)}, ${overlayAnchor.z.toFixed(1)}`, 8, 40);
    const oaTex = new T.CanvasTexture(oaCanvas);
    const oaSpriteMat = new T.SpriteMaterial({ map: oaTex, depthTest: false });
    const oaSprite = new T.Sprite(oaSpriteMat);
    oaSprite.position.copy(overlayAnchor).addScaledVector(vAxis, maxDim * 0.05);
    oaSprite.scale.set(maxDim * 0.2, maxDim * 0.03, 1);
    oaSprite.renderOrder = 999;
    group.add(oaSprite);

    // -- Face coordinate axes (arrows from face center)
    const arrowLen = maxDim * 0.15;
    const arrowOrigin = faceCenter.clone().addScaledVector(normal, 2.0);
    const arrU = new T.ArrowHelper(uAxis, arrowOrigin, arrowLen, 0xff4444, arrowLen * 0.15, arrowLen * 0.08);
    const arrV = new T.ArrowHelper(vAxis, arrowOrigin, arrowLen, 0x44ff44, arrowLen * 0.15, arrowLen * 0.08);
    const arrN = new T.ArrowHelper(normal, arrowOrigin, arrowLen * 0.6, 0x4488ff, arrowLen * 0.15, arrowLen * 0.08);
    group.add(arrU, arrV, arrN);

    // Axis label sprites
    const axisLabels = [
      { label: 'U', color: '#ff4444', pos: arrowOrigin.clone().addScaledVector(uAxis, arrowLen * 1.1) },
      { label: 'V', color: '#44ff44', pos: arrowOrigin.clone().addScaledVector(vAxis, arrowLen * 1.1) },
      { label: 'N', color: '#4488ff', pos: arrowOrigin.clone().addScaledVector(normal, arrowLen * 0.7) },
    ];
    for (const al of axisLabels) {
      const lc = document.createElement('canvas');
      lc.width = 48; lc.height = 48;
      const lctx = lc.getContext('2d')!;
      lctx.font = 'bold 32px monospace';
      lctx.fillStyle = al.color;
      lctx.fillText(al.label, 8, 36);
      const ltex = new T.CanvasTexture(lc);
      const lsMat = new T.SpriteMaterial({ map: ltex, depthTest: false });
      const ls = new T.Sprite(lsMat);
      ls.position.copy(al.pos);
      ls.scale.set(maxDim * 0.04, maxDim * 0.04, 1);
      ls.renderOrder = 999;
      group.add(ls);
    }

    // -- Element position markers (where each 2D element maps to in 3D)
    const storeState = useConfiguratorStore.getState();
    const currentElements = storeState.sideElements[currentSide] || [];
    if (currentElements.length > 0) {
      const elMarkerGeo = new T.SphereGeometry(maxDim * 0.008, 12, 12);
      const elHoleMat = new T.MeshBasicMaterial({ color: 0xf97316, depthTest: false }); // orange for holes
      const elRectMat = new T.MeshBasicMaterial({ color: 0x06b6d4, depthTest: false }); // cyan for rects

      for (const el of currentElements) {
        if (el.type !== 'hole' && el.type !== 'rect') continue;

        // Same coordinate transform as the CSG cutter positioning
        const elSw = panelFc.width / pw;
        const elSh = panelFc.height / ph;
        const elCx = (el.x + (el.w || 0) / 2) * elSw - panelFc.width / 2;
        const elCy = -((el.y + (el.h || 0) / 2) * elSh - panelFc.height / 2);

        const elPos = faceCenter.clone()
          .addScaledVector(uAxis, elCx)
          .addScaledVector(vAxis, elCy)
          .addScaledVector(normal, 2.0);

        const elMat = el.type === 'hole' ? elHoleMat : elRectMat;
        const elMesh = new T.Mesh(elMarkerGeo, elMat);
        elMesh.position.copy(elPos);
        elMesh.renderOrder = 999;
        group.add(elMesh);

        // Show element size + position label
        const elCanvas = document.createElement('canvas');
        elCanvas.width = 256;
        elCanvas.height = 48;
        const elCtx = elCanvas.getContext('2d')!;
        elCtx.fillStyle = el.type === 'hole' ? 'rgba(249,115,22,0.85)' : 'rgba(6,182,212,0.85)';
        elCtx.roundRect(0, 0, 256, 48, 4);
        elCtx.fill();
        elCtx.font = 'bold 16px monospace';
        elCtx.fillStyle = '#fff';
        const sizeStr = el.type === 'hole' ? `⊘${el.diameter}mm` : `${el.w}×${el.h}mm`;
        elCtx.fillText(`${el.type} #${el.id} ${sizeStr}`, 6, 18);
        elCtx.font = '13px monospace';
        elCtx.fillStyle = '#fef3c7';
        elCtx.fillText(`3D: ${elPos.x.toFixed(1)}, ${elPos.y.toFixed(1)}, ${elPos.z.toFixed(1)}`, 6, 38);

        const elTex = new T.CanvasTexture(elCanvas);
        const elSpriteMat = new T.SpriteMaterial({ map: elTex, depthTest: false });
        const elSprite = new T.Sprite(elSpriteMat);
        elSprite.position.copy(elPos).addScaledVector(vAxis, maxDim * 0.03);
        elSprite.scale.set(maxDim * 0.16, maxDim * 0.03, 1);
        elSprite.renderOrder = 999;
        group.add(elSprite);

        // Draw a line from element marker to the face surface (shows depth)
        const surfacePos = faceCenter.clone()
          .addScaledVector(uAxis, elCx)
          .addScaledVector(vAxis, elCy);
        const lineGeo = new T.BufferGeometry().setFromPoints([elPos, surfacePos]);
        const lineMat = new T.LineBasicMaterial({ color: el.type === 'hole' ? 0xf97316 : 0x06b6d4, depthTest: false });
        const line = new T.Line(lineGeo, lineMat);
        line.renderOrder = 999;
        group.add(line);
      }
    }

    // -- Draggable debug point (red sphere)
    const dpGeo = new T.SphereGeometry(maxDim * 0.02, 20, 20);
    const dpMat = new T.MeshBasicMaterial({ color: 0xef4444, depthTest: false });
    const dpMesh = new T.Mesh(dpGeo, dpMat);
    dpMesh.renderOrder = 999;
    const store = useConfiguratorStore.getState();
    dpMesh.position.set(...(store.debugPoint ?? [0, 0, 0]));
    group.add(dpMesh);
    debugPointRef.current = dpMesh;

    scene.add(group);
    debugHelpersRef.current = group;

    // -- Drag controls for the debug point
    (async () => {
      const { DragControls } = await import('three/addons/controls/DragControls.js');
      if (disposedRef.current || !debugMode) return;

      const dc = new DragControls([dpMesh], cam, canvas);
      dc.addEventListener('drag', () => {
        const p = dpMesh.position;
        setDebugCoords([
          Math.round(p.x * 10) / 10,
          Math.round(p.y * 10) / 10,
          Math.round(p.z * 10) / 10,
        ]);
        setDebugPoint([p.x, p.y, p.z]);
      });
      dc.addEventListener('dragstart', () => {
        if (controlsRef.current) controlsRef.current.enabled = false;
      });
      dc.addEventListener('dragend', () => {
        if (controlsRef.current) controlsRef.current.enabled = true;
      });
      dragControlsRef.current = dc;
    })();

    return () => {
      if (debugHelpersRef.current) {
        scene.remove(debugHelpersRef.current);
        disposeGroup(debugHelpersRef.current);
        debugHelpersRef.current = null;
      }
      if (dragControlsRef.current) {
        dragControlsRef.current.dispose();
        dragControlsRef.current = null;
      }
    };
  }, [debugMode, currentSide, currentCabinet, sideElements, getModelSpec, setDebugPoint]);

  return (
    <div className="relative w-full h-full min-h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full outline-none" />
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm z-10">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading 3D model…</p>
        </div>
      )}
      {/* Top-right buttons: Home + Debug toggle */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
        <button
          onClick={() => toggleDebugMode()}
          title="Toggle debug mode"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 backdrop-blur-sm border rounded-lg text-xs shadow-sm transition ${
            debugMode
              ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800'
              : 'bg-white/90 hover:bg-white border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          Debug
        </button>
        <button
          onClick={handleHomeView}
          title="Reset to home view"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 hover:bg-white backdrop-blur-sm border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-slate-900 shadow-sm transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>
      </div>
      {/* Debug coordinate readout */}
      {debugMode && (
        <div className="absolute bottom-10 right-2 z-10 bg-gray-900/90 backdrop-blur-sm text-white rounded-lg px-3 py-2 text-[11px] font-mono space-y-1 min-w-[220px]">
          <div className="text-amber-300 font-bold text-xs mb-1">Debug Point</div>
          <div className="flex justify-between">
            <span className="text-red-400">X:</span>
            <span>{debugCoords[0].toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-400">Y:</span>
            <span>{debugCoords[1].toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-400">Z:</span>
            <span>{debugCoords[2].toFixed(1)}</span>
          </div>
          <div className="border-t border-white/20 pt-1 mt-1">
            <div className="text-cyan-300 font-bold text-xs mb-0.5">Face: {currentSide}</div>
            {(() => {
              const mc = getModelSpec();
              const fc = resolveFace(mc, currentSide);
              const s = cabToSceneRef.current;
              const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);
              return (
                <>
                  <div className="text-gray-400">center: [{fc.center.map(v => v.toFixed(1)).join(', ')}]</div>
                  <div className="text-gray-400">normal: [{fc.normal.join(', ')}]</div>
                  <div className="text-gray-400">panel: {pw.toFixed(0)}×{ph.toFixed(0)}mm</div>
                  <div className="text-gray-400">scale: {s.toFixed(4)}</div>
                </>
              );
            })()}
          </div>
          <button
            onClick={() => {
              const text = `[${debugCoords[0].toFixed(1)}, ${debugCoords[1].toFixed(1)}, ${debugCoords[2].toFixed(1)}]`;
              navigator.clipboard.writeText(text);
            }}
            className="mt-1 w-full text-center text-[10px] bg-white/10 hover:bg-white/20 rounded px-2 py-0.5 transition"
          >
            Copy coordinates
          </button>
        </div>
      )}
      <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded">
        {cab.w}×{cab.h}×{cab.d}mm · {currentSide} · Click face to select
      </div>
    </div>
  );
}
