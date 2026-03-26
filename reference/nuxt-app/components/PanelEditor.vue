<template>
  <div class="flex-1 relative flex items-center justify-center bg-[#FAFAFA] overflow-hidden">
    <div class="absolute inset-0" :style="gridStyle" />
    <div
      ref="canvasRef"
      class="relative w-[340px] h-[400px] bg-gradient-to-br from-gray-200 to-gray-300 border-[1.5px] border-gray-400 rounded-sm z-[1]"
      :style="{ cursor: store.activeTool === 'select' ? 'default' : 'crosshair' }"
      @click="handleClick"
      @mousemove="handleMouseMove"
      @mouseleave="coords = 'X: —   Y: —'"
    >
      <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 tabular-nums">{{ dims.pw }} mm</div>
      <div class="absolute -left-11 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 tabular-nums">{{ dims.ph }} mm</div>

      <!-- Elements -->
      <div
        v-for="el in store.currentElements" :key="el.id"
        :class="['panel-el', typeClass(el.type), el.id === store.selectedElId ? 'selected' : '']"
        :style="{ left: el.x + 'px', top: el.y + 'px', width: el.w + 'px', height: el.h + 'px' }"
        @mousedown.stop="startDrag(el, $event)"
      >
        <span class="el-label">{{ elLabel(el) }}</span>
        <template v-if="el.id === store.selectedElId && el.type !== 'hole'">
          <div class="handle handle-nw" /><div class="handle handle-ne" />
          <div class="handle handle-sw" /><div class="handle handle-se" />
        </template>
      </div>

      <!-- Alignment guides -->
      <template v-if="selectedEl">
        <div class="guide-line guide-line-v" :style="{ left: selectedEl.x + selectedEl.w / 2 + 'px' }" />
        <div class="guide-line guide-line-h" :style="{ top: selectedEl.y + selectedEl.h / 2 + 'px' }" />
      </template>

      <div class="absolute bottom-1.5 left-1.5 text-[10px] text-gray-400 bg-white/90 px-1.5 py-0.5 rounded font-mono tabular-nums z-[5]">{{ coords }}</div>
      <div class="absolute top-1.5 right-1.5 text-[10px] text-emerald-500 bg-emerald-500/5 border border-emerald-500/15 px-1.5 py-0.5 rounded z-[5] flex items-center gap-1">
        <span class="w-[5px] h-[5px] bg-emerald-500 rounded-full" />Snap: 5mm
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ElementType, PanelElement } from '~/utils/types';
import { getPanelDimensions, snap } from '~/utils/constants';

const store = useConfiguratorStore();
const canvasRef = ref<HTMLDivElement | null>(null);
const coords = ref('X: —   Y: —');

const dims = computed(() => getPanelDimensions(store.currentCabinet, store.currentSide));
const selectedEl = computed(() => store.currentElements.find(e => e.id === store.selectedElId));

const gridStyle = {
  backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
};

function typeClass(type: ElementType) {
  return type === 'hole' ? 'el-hole' : type === 'rect' ? 'el-rect' : 'el-opening';
}

function elLabel(el: PanelElement) {
  if (el.type === 'hole') return `Ø${el.diameter}`;
  if (el.type === 'rect') return `${el.w}×${el.h}`;
  return 'Opening';
}

function handleClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.panel-el')) return;
  if (store.activeTool === 'select' || store.activeTool === 'measure') {
    store.selectElement(null);
    return;
  }
  const rect = canvasRef.value!.getBoundingClientRect();
  const x = snap(e.clientX - rect.left);
  const y = snap(e.clientY - rect.top);
  store.addElement(store.activeTool as ElementType, x, y, canvasRef.value!.offsetWidth, canvasRef.value!.offsetHeight);
}

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const mx = ((e.clientX - rect.left) / canvasRef.value.offsetWidth * dims.value.pw).toFixed(0);
  const my = ((e.clientY - rect.top) / canvasRef.value.offsetHeight * dims.value.ph).toFixed(0);
  coords.value = `X: ${mx} mm   Y: ${my} mm`;
}

let dragEl: PanelElement | null = null;
let dragOffX = 0, dragOffY = 0;

function startDrag(el: PanelElement, e: MouseEvent) {
  store.selectElement(el.id);
  const rect = canvasRef.value!.getBoundingClientRect();
  dragEl = el;
  dragOffX = e.clientX - rect.left - el.x;
  dragOffY = e.clientY - rect.top - el.y;
}

onMounted(() => {
  const onMove = (e: MouseEvent) => {
    if (!dragEl || !canvasRef.value) return;
    const r = canvasRef.value.getBoundingClientRect();
    let nx = snap(e.clientX - r.left - dragOffX);
    let ny = snap(e.clientY - r.top - dragOffY);
    nx = Math.max(0, Math.min(canvasRef.value.offsetWidth - dragEl.w, nx));
    ny = Math.max(0, Math.min(canvasRef.value.offsetHeight - dragEl.h, ny));
    store.moveElement(dragEl.id, nx, ny);
  };
  const onUp = () => { dragEl = null; };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  });
});
</script>
