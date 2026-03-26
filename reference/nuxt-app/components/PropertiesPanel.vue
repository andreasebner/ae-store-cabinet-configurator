<template>
  <div class="border-t border-gray-200 px-4 py-3 bg-white">
    <template v-if="!sel">
      <div class="text-center py-4 text-gray-400 text-xs">
        <div class="text-[28px] mb-1.5 opacity-40">◎</div>
        Click on the panel to place elements.<br/>Select a tool from the toolbar above.
      </div>
    </template>
    <template v-else>
      <div class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
        Selected — {{ typeName }}
      </div>
      <div class="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div class="flex items-center gap-1.5">
          <label class="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">X</label>
          <input type="number" :value="realX" step="1"
            @change="store.updateElementProp(sel.id, 'x', Math.round(parseFloat(($event.target as HTMLInputElement).value) / dims.pw * 340))"
            class="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 tabular-nums" />
          <span class="text-[10px] text-gray-400 w-5">mm</span>
        </div>
        <div class="flex items-center gap-1.5">
          <label class="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">Y</label>
          <input type="number" :value="realY" step="1"
            @change="store.updateElementProp(sel.id, 'y', Math.round(parseFloat(($event.target as HTMLInputElement).value) / dims.ph * 400))"
            class="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 tabular-nums" />
          <span class="text-[10px] text-gray-400 w-5">mm</span>
        </div>
        <template v-if="sel.type === 'hole'">
          <div class="flex items-center gap-1.5">
            <label class="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">Ø</label>
            <input type="number" :value="sel.diameter" min="4" max="200" step="1"
              @change="store.updateElementProp(sel.id, 'diameter', parseInt(($event.target as HTMLInputElement).value) || 22)"
              class="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 tabular-nums" />
            <span class="text-[10px] text-gray-400 w-5">mm</span>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-1.5">
            <label class="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">W</label>
            <input type="number" :value="sel.w" min="10" max="500" step="5"
              @change="store.updateElementProp(sel.id, 'w', parseInt(($event.target as HTMLInputElement).value) || 80)"
              class="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 tabular-nums" />
            <span class="text-[10px] text-gray-400 w-5">mm</span>
          </div>
          <div class="flex items-center gap-1.5">
            <label class="text-[11px] text-gray-500 w-5 flex-shrink-0 font-medium">H</label>
            <input type="number" :value="sel.h" min="10" max="500" step="5"
              @change="store.updateElementProp(sel.id, 'h', parseInt(($event.target as HTMLInputElement).value) || 40)"
              class="flex-1 h-7 border border-gray-200 rounded px-2 text-xs text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 tabular-nums" />
            <span class="text-[10px] text-gray-400 w-5">mm</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { getPanelDimensions } from '~/utils/constants';

const store = useConfiguratorStore();
const dims = computed(() => getPanelDimensions(store.currentCabinet, store.currentSide));
const sel = computed(() => store.currentElements.find(e => e.id === store.selectedElId));
const typeName = computed(() => {
  if (!sel.value) return '';
  return sel.value.type === 'hole' ? 'Round Hole' : sel.value.type === 'rect' ? 'Rect Hole' : 'Cable Opening';
});
const realX = computed(() => sel.value ? (sel.value.x / 340 * dims.value.pw).toFixed(1) : '0');
const realY = computed(() => sel.value ? (sel.value.y / 400 * dims.value.ph).toFixed(1) : '0');
</script>
