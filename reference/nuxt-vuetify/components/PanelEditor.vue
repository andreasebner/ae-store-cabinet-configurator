<template>
  <div
    ref="panelRef"
    class="panel-editor flex-grow-1 position-relative overflow-hidden"
    :style="{ cursor: store.activeTool === 'move' ? 'grab' : 'crosshair' }"
    @click="onPanelClick"
  >
    <!-- Grid background -->
    <svg class="grid-svg" width="100%" height="100%">
      <defs>
        <pattern id="vgrid" :width="gridPx" :height="gridPx" patternUnits="userSpaceOnUse">
          <circle :cx="gridPx/2" :cy="gridPx/2" r="0.8" fill="rgba(0,0,0,0.12)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#vgrid)" />
    </svg>

    <!-- Panel surface -->
    <div
      class="panel-surface"
      :style="surfaceStyle"
    >
      <!-- Elements -->
      <div
        v-for="el in store.currentElements"
        :key="el.id"
        class="panel-el"
        :class="{ selected: el.id === store.selectedElId }"
        :style="elementStyle(el)"
        @mousedown.stop="startDrag(el, $event)"
        @click.stop="store.selectElement(el.id)"
      >
        <template v-if="el.type === 'hole'">
          <div class="hole-inner" />
        </template>
      </div>
    </div>

    <!-- Dimension label -->
    <v-chip
      size="x-small"
      variant="tonal"
      color="secondary"
      class="position-absolute"
      style="bottom:8px;left:8px"
    >
      {{ dims }}
    </v-chip>
    <v-chip
      size="x-small"
      variant="tonal"
      class="position-absolute text-capitalize"
      style="bottom:8px;right:8px"
    >
      <v-icon start icon="mdi-rotate-3d-variant" size="14" />
      {{ store.currentSide }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';
import { CABINETS, getPanelDimensions, formatDimensions, SNAP_GRID } from '~/utils/constants';
import type { PanelElement, ElementType } from '~/utils/types';

const store = useConfiguratorStore();
const panelRef = ref<HTMLElement | null>(null);

const cab = computed(() => CABINETS[store.currentCabinet]);
const panelDims = computed(() => getPanelDimensions(store.currentCabinet, store.currentSide));
const dims = computed(() => formatDimensions(store.currentCabinet, store.currentSide));

const SCALE = 0.65;
const gridPx = SNAP_GRID * SCALE;

const surfaceStyle = computed(() => ({
  width: `${panelDims.value.w * SCALE}px`,
  height: `${panelDims.value.h * SCALE}px`,
  transform: `scale(${store.zoomLevel})`,
}));

function elementStyle(el: PanelElement) {
  const base: Record<string, string> = {
    left: `${el.x * SCALE}px`,
    top: `${el.y * SCALE}px`,
    width: `${el.w * SCALE}px`,
    height: `${el.h * SCALE}px`,
  };
  if (el.type === 'hole') base.borderRadius = '50%';
  return base;
}

function onPanelClick(e: MouseEvent) {
  if (store.activeTool === 'move') { store.selectElement(null); return; }
  const rect = panelRef.value?.querySelector('.panel-surface')?.getBoundingClientRect();
  if (!rect) return;
  const x = (e.clientX - rect.left) / SCALE / store.zoomLevel;
  const y = (e.clientY - rect.top) / SCALE / store.zoomLevel;
  store.addElement(store.activeTool as ElementType, x, y, panelDims.value.w, panelDims.value.h);
}

/* Drag logic */
let dragId: number | null = null;
let dragOff = { x: 0, y: 0 };

function startDrag(el: PanelElement, e: MouseEvent) {
  if (store.activeTool !== 'move') return;
  store.selectElement(el.id);
  dragId = el.id;
  dragOff = { x: e.clientX - el.x * SCALE, y: e.clientY - el.y * SCALE };
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}
function onDrag(e: MouseEvent) {
  if (dragId === null) return;
  const x = (e.clientX - dragOff.x) / SCALE;
  const y = (e.clientY - dragOff.y) / SCALE;
  store.moveElement(dragId, x, y);
}
function stopDrag() {
  dragId = null;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
}
</script>

<style scoped>
.panel-editor {
  background: rgb(var(--v-theme-surface-variant));
}
.grid-svg {
  position: absolute; inset: 0; pointer-events: none;
}
.panel-surface {
  position: absolute;
  top: 50%; left: 50%;
  translate: -50% -50%;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.12);
  transform-origin: center;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.panel-el {
  position: absolute;
  border: 2px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.panel-el:hover { box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.3); }
.panel-el.selected { border-color: rgb(var(--v-theme-error)); box-shadow: 0 0 0 3px rgba(var(--v-theme-error), 0.25); }
.hole-inner {
  width: 60%; height: 60%; margin: 20%;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.2);
}
</style>
