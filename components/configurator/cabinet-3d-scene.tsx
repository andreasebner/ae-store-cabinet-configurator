'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { CABINETS, SIDES } from '@/lib/constants';
import type { Side } from '@/lib/types';

let BABYLON: typeof import('@babylonjs/core') | null = null;

const BABYLON_FACE_MAP: Record<Side, number> = {
  front: 1, back: 0, right: 2, left: 3, top: 4, bottom: 5,
};

const CAMERA_POSITIONS: Record<Side, { alpha: number; beta: number }> = {
  front:  { alpha: -Math.PI / 2, beta: Math.PI / 2.3 },
  back:   { alpha: Math.PI / 2,  beta: Math.PI / 2.3 },
  left:   { alpha: Math.PI,      beta: Math.PI / 2.3 },
  right:  { alpha: 0,            beta: Math.PI / 2.3 },
  top:    { alpha: -Math.PI / 2, beta: 0.4 },
  bottom: { alpha: -Math.PI / 2, beta: Math.PI - 0.4 },
};

export default function Cabinet3DScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const boxRef = useRef<any>(null);
  const materialsRef = useRef<any[]>([]);
  const cameraRef = useRef<any>(null);

  const { currentCabinet, currentSide, setSide, sideElements } = useConfiguratorStore();
  const cab = CABINETS[currentCabinet];

  const initScene = useCallback(async () => {
    if (!canvasRef.current || !BABYLON) return;

    const engine = new BABYLON.Engine(canvasRef.current, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color4(0.97, 0.97, 0.98, 1);

    const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 2.5, 3.5, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 8;
    camera.wheelDeltaPercentage = 0.01;
    camera.panningSensibility = 0;
    cameraRef.current = camera;

    new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
    const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-0.5, -1, 0.5), scene);
    dir.intensity = 0.6;

    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene);
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.93, 0.93, 0.95);
    groundMat.alpha = 0.5;
    ground.material = groundMat;
    ground.position.y = -1;

    createBox(scene);

    scene.onPointerDown = (_evt: any, pickResult: any) => {
      if (pickResult.hit && pickResult.pickedMesh === boxRef.current && pickResult.faceId !== undefined) {
        const faceIndex = Math.floor(pickResult.faceId / 2);
        const sideForFace = Object.entries(BABYLON_FACE_MAP).find(([, v]) => v === faceIndex);
        if (sideForFace) setSide(sideForFace[0] as Side);
      }
    };

    engine.runRenderLoop(() => scene.render());

    const resizeObserver = new ResizeObserver(() => engine.resize());
    resizeObserver.observe(canvasRef.current);

    return () => {
      resizeObserver.disconnect();
      engine.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createBox = useCallback((scene: any) => {
    if (!BABYLON) return;
    if (boxRef.current) boxRef.current.dispose();
    materialsRef.current.forEach(m => m.dispose());

    const scaleF = 1 / 500;
    const w = cab.w * scaleF;
    const h = cab.h * scaleF;
    const d = cab.d * scaleF;

    const box = BABYLON.MeshBuilder.CreateBox('cabinet', { width: w, height: h, depth: d }, scene);
    boxRef.current = box;

    const multiMat = new BABYLON.MultiMaterial('cabinetMulti', scene);
    const faceMats: any[] = [];

    const baseColor = new BABYLON.Color3(0.85, 0.88, 0.92);
    const activeColor = new BABYLON.Color3(0.30, 0.43, 0.96);

    SIDES.forEach(side => {
      const mat = new BABYLON.StandardMaterial(`mat_${side}`, scene);
      const isActive = side === currentSide;
      mat.diffuseColor = isActive ? activeColor : baseColor;
      mat.alpha = isActive ? 0.95 : 0.75;
      mat.backFaceCulling = false;
      mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

      const elCount = sideElements[side]?.length || 0;
      if (elCount > 0 && !isActive) {
        mat.emissiveColor = new BABYLON.Color3(0.1, 0.15, 0.05);
      }
      faceMats.push(mat);
    });

    materialsRef.current = faceMats;

    box.subMeshes = [];
    const verticesCount = box.getTotalVertices();
    const faceOrder: Side[] = ['back', 'front', 'right', 'left', 'top', 'bottom'];
    faceOrder.forEach((side, i) => {
      const sideIndex = SIDES.indexOf(side);
      multiMat.subMaterials.push(faceMats[sideIndex]);
      new BABYLON.SubMesh(i, 0, verticesCount, i * 6, 6, box);
    });
    box.material = multiMat;

    box.enableEdgesRendering();
    box.edgesWidth = 2.0;
    box.edgesColor = new BABYLON.Color4(0.3, 0.4, 0.5, 0.8);
  }, [cab, currentSide, sideElements]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    import('@babylonjs/core').then(mod => {
      BABYLON = mod;
      initScene().then(c => { cleanup = c; });
    });
    return () => { cleanup?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sceneRef.current && BABYLON) createBox(sceneRef.current);
  }, [createBox]);

  useEffect(() => {
    if (!cameraRef.current || !BABYLON) return;
    const target = CAMERA_POSITIONS[currentSide];
    const cam = cameraRef.current;
    const scene = sceneRef.current;
    if (!scene) return;

    const alphaAnim = new BABYLON.Animation('camAlpha', 'alpha', 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    alphaAnim.setKeys([{ frame: 0, value: cam.alpha }, { frame: 15, value: target.alpha }]);

    const betaAnim = new BABYLON.Animation('camBeta', 'beta', 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    betaAnim.setKeys([{ frame: 0, value: cam.beta }, { frame: 15, value: target.beta }]);

    cam.animations = [alphaAnim, betaAnim];
    scene.beginAnimation(cam, 0, 15, false);
  }, [currentSide]);

  return (
    <div className="relative w-full h-full min-h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full outline-none" />
      <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded">
        {cab.w}×{cab.h}×{cab.d}mm · Click face to select
      </div>
    </div>
  );
}
