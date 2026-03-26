<template>
  <div class="flex-1 flex flex-col bg-[#F3F4F8] relative">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-4 py-3">
      <span class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">3D Preview</span>
      <div class="flex gap-0.5 bg-white/70 backdrop-blur-sm rounded-md p-0.5">
        <button
          v-for="vm in viewModes" :key="vm.key"
          @click="handleViewMode(vm.key)"
          :class="[
            'px-2.5 py-1 rounded text-[11px] font-medium transition-all',
            viewMode === vm.key ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-black/[0.04]'
          ]"
        >{{ vm.label }}</button>
      </div>
    </div>

    <!-- 3D Scene -->
    <div
      ref="containerRef"
      class="flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style="perspective: 900px"
      @mousedown="onMouseDown"
    >
      <div
        class="w-[260px] h-[340px] relative"
        :style="{ transformStyle: 'preserve-3d', transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)', transform: cabinetTransform }"
      >
        <div
          v-for="face in facesData" :key="face.side"
          :class="['face', face.className, store.currentSide === face.side ? 'selected' : '']"
          @click.stop="handleSelectSide(face.side)"
        >
          <!-- Door details on front -->
          <template v-if="face.side === 'front'">
            <div class="absolute right-5 top-1/2 -translate-y-1/2 w-1 h-[60px] bg-gradient-to-b from-slate-200 to-slate-400 rounded-sm shadow-[1px_0_2px_rgba(0,0,0,0.15)]" />
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-[5px]">
              <div v-for="i in 4" :key="i" class="w-8 h-0.5 bg-black/10 rounded-sm" />
            </div>
          </template>
          <span>{{ face.side.charAt(0).toUpperCase() + face.side.slice(1) }}</span>
        </div>
      </div>
    </div>

    <!-- Zoom Controls -->
    <div class="absolute bottom-[70px] right-4 flex flex-col bg-white rounded-lg shadow overflow-hidden z-10">
      <button @click="store.setZoom(store.zoomLevel + 0.15)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-[15px]">+</button>
      <button @click="store.setZoom(store.zoomLevel - 0.15)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-[15px]">−</button>
      <button @click="store.setZoom(1); handleSelectSide(store.currentSide)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-[15px]">⊡</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Side, ViewMode } from '~/utils/types';
import { SIDE_ROTATIONS, VIEW_TRANSFORMS } from '~/utils/constants';

const store = useConfiguratorStore();

const viewModes = [
  { key: 'perspective' as ViewMode, label: 'Perspective' },
  { key: 'front' as ViewMode, label: 'Front' },
  { key: 'top' as ViewMode, label: 'Top' },
  { key: 'side' as ViewMode, label: 'Side' },
];

const facesData = [
  { side: 'front' as Side, className: 'face-front' },
  { side: 'back' as Side, className: 'face-back' },
  { side: 'left' as Side, className: 'face-left' },
  { side: 'right' as Side, className: 'face-right' },
  { side: 'top' as Side, className: 'face-top' },
  { side: 'bottom' as Side, className: 'face-bottom' },
];

const containerRef = ref<HTMLDivElement | null>(null);
const viewMode = ref<ViewMode>('perspective');
const cabinetTransform = ref(SIDE_ROTATIONS.front);

const dragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const rotX = ref(-15);
const rotY = ref(-25);

function applyTransform(t: string) {
  cabinetTransform.value = store.zoomLevel !== 1 ? `${t} scale(${store.zoomLevel})` : t;
}

function handleSelectSide(side: Side) {
  store.setSide(side);
  viewMode.value = 'perspective';
  applyTransform(SIDE_ROTATIONS[side]);
  const rots: Record<string, { x: number; y: number }> = {
    front: { x: -15, y: -25 }, back: { x: -15, y: 155 },
    left: { x: -15, y: 65 }, right: { x: -15, y: -65 },
    top: { x: -65, y: -25 }, bottom: { x: 45, y: -25 },
  };
  const r = rots[side] || rots.front;
  rotX.value = r.x; rotY.value = r.y;
}

function handleViewMode(mode: ViewMode) {
  viewMode.value = mode;
  if (mode === 'perspective') {
    applyTransform(SIDE_ROTATIONS[store.currentSide]);
  } else {
    applyTransform(VIEW_TRANSFORMS[mode]);
  }
}

function onMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.face')) return;
  dragging.value = true;
  startX.value = e.clientX;
  startY.value = e.clientY;
  viewMode.value = 'perspective';
}

onMounted(() => {
  const onMove = (e: MouseEvent) => {
    if (!dragging.value) return;
    const dx = e.clientX - startX.value;
    const dy = e.clientY - startY.value;
    rotY.value += dx * 0.5;
    rotX.value = Math.max(-80, Math.min(80, rotX.value - dy * 0.5));
    startX.value = e.clientX;
    startY.value = e.clientY;
    applyTransform(`rotateX(${rotX.value}deg) rotateY(${rotY.value}deg)`);
  };
  const onUp = () => { dragging.value = false; };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  });
});
</script>
