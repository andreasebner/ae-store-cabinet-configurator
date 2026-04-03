'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { CABINETS, getPanelDimensions } from '@/lib/constants';
import { resolveFace, type FaceConfig } from '@/lib/face-config';
import type { Side, PanelElement, CabinetSpec } from '@/lib/types';

const MAX_HOLES = 32;
const MAX_RECTS = 16;

/* ──────────────────────────────────────────────────────────────────── *
 *  Hole + rect cutout shader plugin
 *
 *  Projects each fragment's world-space position onto the active face
 *  plane. Discards fragments inside circular holes or rectangular rects.
 * ──────────────────────────────────────────────────────────────────── */

function createCutoutShaderPlugin(THREE: typeof import('three'), fc: FaceConfig) {
  const uniforms = {
    holeFaceCenter: { value: new THREE.Vector3(...fc.center) },
    holeFaceUAxis:  { value: new THREE.Vector3(...fc.uAxis) },
    holeFaceVAxis:  { value: new THREE.Vector3(...fc.vAxis) },
    holeFaceNormal: { value: new THREE.Vector3(...fc.normal) },
    holeDepthMin:   { value: -(fc.throughDepth + 3.0) },
    holeDepthMax:   { value: 3.0 },
    holeCount:      { value: 0 },
    holeData:       { value: Array.from({ length: MAX_HOLES }, () => new THREE.Vector4()) },
    rectCount:      { value: 0 },
    rectData:       { value: Array.from({ length: MAX_RECTS }, () => new THREE.Vector4()) },
  };

  function onBeforeCompile(shader: any) {
    Object.assign(shader.uniforms, uniforms);

    // Vertex: pass world position to fragment
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      '#include <common>\nvarying vec3 vCutoutWorldPos;',
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
       vCutoutWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
    );

    // Fragment: uniforms + discard logic
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
uniform int   rectCount;
uniform vec4  rectData[${MAX_RECTS}];
varying vec3  vCutoutWorldPos;`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <clipping_planes_fragment>',
      `#include <clipping_planes_fragment>
  {
    vec3  toFrag = vCutoutWorldPos - holeFaceCenter;
    float hn     = dot(toFrag, holeFaceNormal);
    if (hn >= holeDepthMin && hn <= holeDepthMax) {
      float hu = dot(toFrag, holeFaceUAxis);
      float hv = dot(toFrag, holeFaceVAxis);
      // Circular holes
      for (int i = 0; i < ${MAX_HOLES}; i++) {
        if (i >= holeCount) break;
        float dist = length(vec2(hu - holeData[i].x, hv - holeData[i].y));
        if (dist < holeData[i].z) discard;
      }
      // Rectangular cutouts (rectData: u_center, v_center, half_w, half_h)
      for (int j = 0; j < ${MAX_RECTS}; j++) {
        if (j >= rectCount) break;
        float du = abs(hu - rectData[j].x);
        float dv = abs(hv - rectData[j].y);
        if (du < rectData[j].z && dv < rectData[j].w) discard;
      }
    }
  }`,
    );
  }

  function setFace(fc2: FaceConfig) {
    uniforms.holeFaceCenter.value.set(...fc2.center);
    uniforms.holeFaceUAxis.value.set(...fc2.uAxis);
    uniforms.holeFaceVAxis.value.set(...fc2.vAxis);
    uniforms.holeFaceNormal.value.set(...fc2.normal);
    uniforms.holeDepthMin.value = -(fc2.throughDepth + 3.0);
    uniforms.holeDepthMax.value = 3.0;
  }

  /** Push holes + rects from model-space panel coordinates into shader uniforms. */
  function updateCutouts(
    holes: { x: number; y: number; radius: number }[],
    rects: { x: number; y: number; hw: number; hh: number }[],
    fc2: FaceConfig,
  ) {
    // Circular holes
    uniforms.holeCount.value = Math.min(holes.length, MAX_HOLES);
    for (let i = 0; i < MAX_HOLES; i++) {
      if (i < holes.length) {
        const h = holes[i];
        const u = h.x - fc2.width / 2;
        const v = -(h.y - fc2.height / 2);
        uniforms.holeData.value[i].set(u, v, h.radius, 0);
      } else {
        uniforms.holeData.value[i].set(0, 0, 0, 0);
      }
    }
    // Rectangular cutouts
    uniforms.rectCount.value = Math.min(rects.length, MAX_RECTS);
    for (let i = 0; i < MAX_RECTS; i++) {
      if (i < rects.length) {
        const r = rects[i];
        const u = r.x - fc2.width / 2;
        const v = -(r.y - fc2.height / 2);
        uniforms.rectData.value[i].set(u, v, r.hw, r.hh);
      } else {
        uniforms.rectData.value[i].set(0, 0, 0, 0);
      }
    }
  }

  return { onBeforeCompile, setFace, updateCutouts, uniforms };
}

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
  const frameLineRef    = useRef<any>(null);
  const shaderPluginRef = useRef<ReturnType<typeof createCutoutShaderPlugin> | null>(null);
  const pickBoxRef      = useRef<any>(null);
  const loadedUrlRef    = useRef<string | null>(null);
  const modelDimsRef    = useRef<{ w: number; h: number; d: number } | null>(null);
  const rafRef          = useRef<number>(0);
  const disposedRef     = useRef(false);

  const { currentCabinet, currentSide, sideElements } = useConfiguratorStore();
  const cab = CABINETS[currentCabinet];

  /** Build a CabinetSpec-compatible object from the loaded model's actual dimensions. */
  const getModelSpec = useCallback((): CabinetSpec => {
    const d = modelDimsRef.current;
    if (d) return { name: '', w: d.w, h: d.h, d: d.d, basePrice: 0, description: '', bodyCenter: [0, 0, 0] };
    return cab;
  }, [cab]);

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
    const dist = maxDim * 1.6;

    // Isometric-ish angle: slightly right, slightly above, slightly in front
    cam.position.set(dist * 0.7, dist * 0.5, dist * 0.8);
    ctl.target.set(0, 0, 0);
    ctl.update();
  }, []);

  /* ── Wireframe showing editable area on the active face ── */
  const updateFrame = useCallback((THREE: typeof import('three'), fc: FaceConfig) => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (frameLineRef.current) {
      scene.remove(frameLineRef.current);
      frameLineRef.current.geometry?.dispose();
      frameLineRef.current.material?.dispose();
      frameLineRef.current = null;
    }

    const hw = fc.width / 2, hh = fc.height / 2;
    const pts = [
      new THREE.Vector3(-hw, -hh, 0),
      new THREE.Vector3( hw, -hh, 0),
      new THREE.Vector3( hw,  hh, 0),
      new THREE.Vector3(-hw,  hh, 0),
      new THREE.Vector3(-hw, -hh, 0),
    ];

    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat  = new THREE.LineBasicMaterial({ color: 0x00ccff, linewidth: 2, depthTest: true });
    const line = new THREE.Line(geom, mat);

    line.quaternion.copy(faceQuaternion(THREE, fc));
    const center = new THREE.Vector3(...fc.center);
    const normal = new THREE.Vector3(...fc.normal);
    line.position.copy(center).addScaledVector(normal, 0.5);

    scene.add(line);
    frameLineRef.current = line;
  }, []);

  /* ── Sync 2D panel elements → 3D cutout shader ── */
  const syncCutouts = useCallback((fc: FaceConfig) => {
    const plugin = shaderPluginRef.current;
    if (!plugin) return;

    const store = useConfiguratorStore.getState();
    const side = store.currentSide;
    const elements = store.sideElements[side] || [];
    const { pw: panelW, ph: panelH } = getPanelDimensions(store.currentCabinet, side);

    // Scale from 2D panel space (cabinet mm) to model face space (model mm)
    const sw = fc.width / panelW;
    const sh = fc.height / panelH;

    const holes: { x: number; y: number; radius: number }[] = [];
    const rects: { x: number; y: number; hw: number; hh: number }[] = [];

    elements.forEach((el: PanelElement) => {
      if (el.type === 'hole' && el.diameter) {
        holes.push({
          x: (el.x + (el.w || 0) / 2) * sw,
          y: (el.y + (el.h || 0) / 2) * sh,
          radius: ((el.diameter || 0) / 2) * Math.min(sw, sh),
        });
      } else if (el.type === 'rect') {
        rects.push({
          x: (el.x + el.w / 2) * sw,
          y: (el.y + el.h / 2) * sh,
          hw: (el.w / 2) * sw,
          hh: (el.h / 2) * sh,
        });
      }
    });

    plugin.updateCutouts(holes, rects, fc);
  }, []);

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
      scene.background = new THREE.Color(0xf8f8fa);
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

        // Face config from body dims
        const store = useConfiguratorStore.getState();
        const modelSpec: CabinetSpec = { name: '', w: mw, h: mh, d: md, basePrice: 0, description: '', bodyCenter: [0, 0, 0] };
        const fc = resolveFace(modelSpec, store.currentSide);

        // Create cutout shader plugin
        const plugin = createCutoutShaderPlugin(T, fc);
        shaderPluginRef.current = plugin;

        // Material with cutout shader
        const mat = new T.MeshStandardMaterial({
          color: 0x8899aa,
          metalness: 0.3,
          roughness: 0.6,
        });
        mat.onBeforeCompile = plugin.onBeforeCompile;
        // Unique cache key so Three.js doesn't reuse a cached shader without our modifications
        (mat as any).customProgramCacheKey = () => 'cutoutShader';

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

        model.traverse((child: any) => {
          if (child.isMesh) {
            child.material = doorNames.has(child.name) ? doorMat : mat;
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

        // Position camera to home view, show wireframe, sync cutouts
        resetCameraToHome(T, fc);
        updateFrame(T, fc);
        syncCutouts(fc);

        setLoading(false);
        console.log('[3D] Model loaded, body dims:', mw.toFixed(0), mh.toFixed(0), md.toFixed(0), 'scale:', uniformScale.toFixed(3));
      }, undefined, (err: any) => {
        console.warn('Failed to load GLB model:', err);
        setLoading(false);
      });
    })();
  }, [cab.modelUrl, cab, getModelSpec, resetCameraToHome, positionCamera, updateFrame, syncCutouts]);

  /* ── Update frame + camera + shader when side changes ── */
  useEffect(() => {
    const T = threeRef.current;
    if (!T || !sceneRef.current) return;
    const mc = getModelSpec();
    const fc = resolveFace(mc, currentSide);

    positionCamera(T, fc);
    updateFrame(T, fc);
    shaderPluginRef.current?.setFace(fc);
    syncCutouts(fc);
  }, [currentSide, getModelSpec, positionCamera, updateFrame, syncCutouts]);

  /* ── Re-sync cutouts when 2D elements change ── */
  useEffect(() => {
    const mc = getModelSpec();
    const fc = resolveFace(mc, currentSide);
    syncCutouts(fc);
  }, [sideElements, currentSide, getModelSpec, syncCutouts]);

  /* ── Face click via raycasting ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onClick(e: MouseEvent) {
      const T = threeRef.current;
      const cam = cameraRef.current;
      const box = pickBoxRef.current;
      if (!T || !cam || !box) return;

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
      if (side) useConfiguratorStore.getState().setSide(side);
    }

    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, []);

  const handleHomeView = useCallback(() => {
    const T = threeRef.current;
    if (T) resetCameraToHome(T);
  }, [resetCameraToHome]);

  return (
    <div className="relative w-full h-full min-h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full outline-none" />
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm z-10">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading 3D model…</p>
        </div>
      )}
      {/* Home view reset button */}
      <button
        onClick={handleHomeView}
        title="Reset to home view"
        className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 hover:bg-white backdrop-blur-sm border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-slate-900 shadow-sm transition"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </button>
      <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded">
        {cab.w}×{cab.h}×{cab.d}mm · {currentSide} · Click face to select
      </div>
    </div>
  );
}
