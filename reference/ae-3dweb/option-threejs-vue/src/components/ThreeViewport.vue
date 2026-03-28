<template>
  <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block;" />
</template>

<script setup>
import * as THREE from 'three';
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { useThreeScene } from '../composables/useThreeScene.js';
import { useHoleStore } from '../composables/useHoleStore.js';
import { createFrame, createHoleShader } from '../composables/useCsg.js';
import { getDefaultModel, resolveFace } from '../config/models.js';

const canvasRef = ref(null);
const { holes, panelWidth, panelHeight } = useHoleStore();
const threeScene = useThreeScene();

let frameLine = null;        // wireframe rectangle showing editable area
let holeShaderPlugin = null; // shader plugin for hole discard
let resizeObserver = null;
let debounceTimer = null;
let faceConfig = null;       // resolved face geometry from body config

function syncHoles() {
  if (holeShaderPlugin) {
    holeShaderPlugin.updateHoles([...holes]);
  }
}

function debouncedSync() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(syncHoles, 100);
}

onMounted(async () => {
  const canvas = canvasRef.value;
  threeScene.init(canvas);

  // Handle resize
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        threeScene.resize(width, height);
      }
    }
  });
  resizeObserver.observe(canvas.parentElement);
  const rect = canvas.parentElement.getBoundingClientRect();
  threeScene.resize(rect.width, rect.height);

  // Load model from config
  const modelConfig = getDefaultModel();
  faceConfig = resolveFace(modelConfig);

  // Create shader plugin for hole punching
  holeShaderPlugin = createHoleShader(faceConfig);

  try {
    await threeScene.loadModel(modelConfig.file, holeShaderPlugin);

    // Set panel dimensions from resolved face
    panelWidth.value = faceConfig.width;
    panelHeight.value = faceConfig.height;

    // Position camera to view the editable face
    const faceNormal = new THREE.Vector3(...faceConfig.normal);
    const faceCenter = new THREE.Vector3(...faceConfig.center);
    const maxDim = Math.max(faceConfig.width, faceConfig.height) * 1.8;

    threeScene.camera.position.set(
      faceCenter.x + faceNormal.x * maxDim + maxDim * 0.3,
      faceCenter.y + maxDim * 0.25,
      faceCenter.z + faceNormal.z * maxDim + maxDim * 0.3
    );
    threeScene.controls.value.target.copy(faceCenter);
    threeScene.controls.value.update();

    // Create the wireframe frame showing the editable area
    frameLine = createFrame(faceConfig);
    threeScene.scene.add(frameLine);

    syncHoles();

    console.log('Model loaded. Panel on face:', faceConfig.name, faceConfig);
  } catch (e) {
    console.warn('Could not load cabinet model:', e);
  }
});

// Watch holes for changes and update shader uniforms
watchEffect(() => {
  const _ = holes.length;
  holes.forEach(h => { h.x; h.y; h.radius; });
  panelWidth.value;
  panelHeight.value;
  debouncedSync();
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  clearTimeout(debounceTimer);
  threeScene.dispose();
});
</script>
