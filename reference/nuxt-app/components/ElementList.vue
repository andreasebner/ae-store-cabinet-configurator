<template>
  <div v-if="store.currentElements.length > 0" class="px-4 pb-2">
    <div class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold my-2">
      Elements ({{ store.currentElements.length }})
    </div>
    <ul class="space-y-0.5">
      <li
        v-for="el in store.currentElements" :key="el.id"
        @click="store.selectElement(el.id)"
        :class="[
          'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-xs',
          el.id === store.selectedElId ? 'bg-indigo-50' : 'hover:bg-gray-100'
        ]"
      >
        <div :class="['w-6 h-6 rounded-[5px] flex items-center justify-center flex-shrink-0', iconColor(el.type)]">
          <svg v-if="el.type === 'hole'" viewBox="0 0 14 14" fill="none" class="w-[13px] h-[13px]"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/></svg>
          <svg v-else-if="el.type === 'rect'" viewBox="0 0 14 14" fill="none" class="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>
          <svg v-else viewBox="0 0 14 14" fill="none" class="w-[13px] h-[13px]"><rect x="2" y="3.5" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-xs">{{ elName(el) }}</div>
          <div class="text-[10px] text-gray-400 tabular-nums">X: {{ rx(el) }} Y: {{ ry(el) }}</div>
        </div>
        <button @click.stop="store.deleteElement(el.id)" class="w-[22px] h-[22px] rounded flex items-center justify-center text-gray-400 hover:bg-red-500/[0.08] hover:text-red-500 transition-all text-sm">×</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { ElementType, PanelElement } from '~/utils/types';
import { getPanelDimensions } from '~/utils/constants';

const store = useConfiguratorStore();
const dims = computed(() => getPanelDimensions(store.currentCabinet, store.currentSide));

function iconColor(type: ElementType) {
  return type === 'hole' ? 'bg-indigo-500/[0.08] text-indigo-500' : type === 'rect' ? 'bg-amber-500/[0.08] text-amber-700' : 'bg-red-500/[0.08] text-red-500';
}
function elName(el: PanelElement) {
  return el.type === 'hole' ? `Round Hole Ø${el.diameter}` : el.type === 'rect' ? `Rect Hole ${el.w}×${el.h}` : 'Cable Opening';
}
function rx(el: PanelElement) { return (el.x / 340 * dims.value.pw).toFixed(0); }
function ry(el: PanelElement) { return (el.y / 400 * dims.value.ph).toFixed(0); }
</script>
