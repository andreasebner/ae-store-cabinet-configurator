import { shallowRef } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function useThreeScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
  camera.position.set(0, 0, 800);

  const renderer = shallowRef(null);
  const controls = shallowRef(null);
  const cabinetModel = shallowRef(null);
  const modelSize = shallowRef(null);
  const gltfLoader = new GLTFLoader();

  function init(canvas) {
    renderer.value = new THREE.WebGLRenderer({ canvas, antialias: true, stencil: true });
    renderer.value.setPixelRatio(window.devicePixelRatio);
    renderer.value.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.value.toneMappingExposure = 1.0;

    controls.value = new OrbitControls(camera, canvas);
    controls.value.enableDamping = true;
    controls.value.dampingFactor = 0.1;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(200, 300, 400);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-200, -100, -200);
    scene.add(dirLight2);

    animate();
  }

  function resize(width, height) {
    if (!renderer.value) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.value.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (controls.value) controls.value.update();
    if (renderer.value) renderer.value.render(scene, camera);
  }

  function loadModel(url, shaderPlugin) {
    return new Promise((resolve, reject) => {
      gltfLoader.load(url, (gltf) => {
        const model = gltf.scene;

        // Compute bounding box and center the model at origin
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);

        // Apply a uniform material with optional shader plugin for hole punching.
        const mat = new THREE.MeshStandardMaterial({
          color: 0x8899aa,
          metalness: 0.3,
          roughness: 0.6,
        });
        if (shaderPlugin) {
          mat.onBeforeCompile = shaderPlugin.onBeforeCompile;
        }

        model.traverse((child) => {
          if (child.isMesh) {
            child.material = mat;
          }
        });

        cabinetModel.value = model;
        modelSize.value = size;
        scene.add(model);

        console.log('Model loaded:', url, 'size:', size, 'centered from:', center);
        resolve({ model, size, center });
      }, undefined, reject);
    });
  }

  function dispose() {
    if (renderer.value) renderer.value.dispose();
    if (controls.value) controls.value.dispose();
  }

  return {
    scene,
    camera,
    renderer,
    controls,
    cabinetModel,
    modelSize,
    init,
    resize,
    loadModel,
    dispose,
  };
}
