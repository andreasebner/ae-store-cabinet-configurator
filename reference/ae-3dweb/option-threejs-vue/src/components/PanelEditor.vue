<template>
  <div class="panel-editor">
    <div class="toolbar">
      <span class="title">Panel Editor</span>
      <label>
        W: <input type="number" v-model.number="panelWidth" min="50" max="2000" step="10" />mm
      </label>
      <label>
        H: <input type="number" v-model.number="panelHeight" min="50" max="2000" step="10" />mm
      </label>
      <label>
        Hole ⌀: <input type="number" v-model.number="defaultRadius" min="1" max="100" step="1" />mm
      </label>
      <span class="hint">Click to add holes. Drag to move. Right-click to delete.</span>
    </div>
    <div ref="stageContainer" class="stage-container">
      <v-stage ref="stageRef" :config="stageConfig" @mousedown="onStageClick" @touchstart="onStageClick">
        <v-layer>
          <!-- Panel background -->
          <v-rect :config="panelRectConfig" />

          <!-- Grid lines -->
          <v-line v-for="line in gridLines" :key="line.key" :config="line" />

          <!-- Holes -->
          <v-circle
            v-for="hole in holes"
            :key="hole.id"
            :config="holeConfig(hole)"
            @dragmove="(e) => onHoleDrag(e, hole)"
            @contextmenu="(e) => onHoleRightClick(e, hole)"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useHoleStore } from '../composables/useHoleStore.js';

const { holes, panelWidth, panelHeight, addHole, updateHole, removeHole } = useHoleStore();
const defaultRadius = ref(15);
const stageContainer = ref(null);
const stageRef = ref(null);

const stageWidth = ref(400);
const stageHeight = ref(300);

// Scale factor: pixels per mm
const scale = computed(() => {
  const padding = 40;
  const availW = stageWidth.value - padding * 2;
  const availH = stageHeight.value - padding * 2;
  return Math.min(availW / panelWidth.value, availH / panelHeight.value);
});

const offsetX = computed(() => (stageWidth.value - panelWidth.value * scale.value) / 2);
const offsetY = computed(() => (stageHeight.value - panelHeight.value * scale.value) / 2);

const stageConfig = computed(() => ({
  width: stageWidth.value,
  height: stageHeight.value,
}));

const panelRectConfig = computed(() => ({
  x: offsetX.value,
  y: offsetY.value,
  width: panelWidth.value * scale.value,
  height: panelHeight.value * scale.value,
  fill: '#e8e8e8',
  stroke: '#333',
  strokeWidth: 2,
}));

const gridLines = computed(() => {
  const lines = [];
  const s = scale.value;
  const ox = offsetX.value;
  const oy = offsetY.value;
  const step = 50; // 50mm grid

  for (let x = step; x < panelWidth.value; x += step) {
    lines.push({
      key: `vg-${x}`,
      points: [ox + x * s, oy, ox + x * s, oy + panelHeight.value * s],
      stroke: '#ccc',
      strokeWidth: 0.5,
    });
  }
  for (let y = step; y < panelHeight.value; y += step) {
    lines.push({
      key: `hg-${y}`,
      points: [ox, oy + y * s, ox + panelWidth.value * s, oy + y * s],
      stroke: '#ccc',
      strokeWidth: 0.5,
    });
  }
  return lines;
});

function holeConfig(hole) {
  return {
    x: offsetX.value + hole.x * scale.value,
    y: offsetY.value + hole.y * scale.value,
    radius: hole.radius * scale.value,
    fill: '#333',
    opacity: 0.8,
    stroke: '#111',
    strokeWidth: 1,
    draggable: true,
  };
}

function onStageClick(e) {
  // Only add hole if clicking on the stage background (not on a hole)
  const target = e.target;
  const stage = stageRef.value?.getNode();
  if (!stage) return;
  const className = target?.getClassName?.();
  // Allow clicks on Stage, Layer, or the background Rect
  if (className === 'Circle') return;

  const pos = stage.getPointerPosition();
  if (!pos) return;

  // Convert pixel coords to mm
  const mmX = (pos.x - offsetX.value) / scale.value;
  const mmY = (pos.y - offsetY.value) / scale.value;

  // Check bounds
  if (mmX < 0 || mmX > panelWidth.value || mmY < 0 || mmY > panelHeight.value) return;

  addHole(mmX, mmY, defaultRadius.value);
}

function onHoleDrag(e, hole) {
  const node = e.target;
  const mmX = (node.x() - offsetX.value) / scale.value;
  const mmY = (node.y() - offsetY.value) / scale.value;

  // Clamp to panel bounds
  const clamped = {
    x: Math.max(hole.radius, Math.min(panelWidth.value - hole.radius, mmX)),
    y: Math.max(hole.radius, Math.min(panelHeight.value - hole.radius, mmY)),
  };

  updateHole(hole.id, clamped);

  // Snap node position to clamped value
  node.x(offsetX.value + clamped.x * scale.value);
  node.y(offsetY.value + clamped.y * scale.value);
}

function onHoleRightClick(e, hole) {
  e.evt.preventDefault();
  removeHole(hole.id);
}

let resizeObserver = null;

onMounted(() => {
  function updateSize() {
    if (stageContainer.value) {
      const rect = stageContainer.value.getBoundingClientRect();
      stageWidth.value = rect.width;
      stageHeight.value = rect.height;
    }
  }
  resizeObserver = new ResizeObserver(updateSize);
  resizeObserver.observe(stageContainer.value);
  updateSize();
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
.panel-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.toolbar {
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13px;
}
.toolbar .title {
  font-weight: 600;
  font-size: 14px;
}
.toolbar label {
  display: flex;
  align-items: center;
  gap: 4px;
}
.toolbar input[type="number"] {
  width: 60px;
  padding: 2px 4px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.toolbar .hint {
  color: #888;
  font-size: 11px;
  margin-left: auto;
}
.stage-container {
  flex: 1;
  overflow: hidden;
}
</style>
