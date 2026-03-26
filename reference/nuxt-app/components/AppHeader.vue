<template>
  <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 z-50">
    <div class="flex items-center gap-2 text-[17px] font-bold text-indigo-500 tracking-tight">
      <div class="w-7 h-7 bg-indigo-500 rounded-[7px] flex items-center justify-center text-white text-sm font-bold">C</div>
      CabinetPro
    </div>

    <div class="flex items-center gap-3">
      <div class="relative">
        <select
          :value="store.currentCabinet"
          @change="store.setCabinet(($event.target as HTMLSelectElement).value as CabinetKey)"
          class="appearance-none border border-gray-200 bg-white px-3 py-1.5 pr-8 rounded-md text-[13px] font-semibold text-gray-900 cursor-pointer outline-none focus:border-indigo-500"
        >
          <option v-for="(spec, key) in CABINETS" :key="key" :value="key">{{ spec.label }}</option>
        </select>
        <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-500 pointer-events-none">▾</span>
      </div>
      <span class="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-medium tabular-nums">
        {{ formatDimensions(store.currentCabinet) }}
      </span>
      <div class="flex items-center gap-1.5 ml-2">
        <div class="flex items-center gap-1 text-xs text-emerald-500 font-medium">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-500 text-white">✓</span> Select
        </div>
        <span class="text-gray-200 text-[10px]">→</span>
        <div class="flex items-center gap-1 text-xs text-indigo-500 font-medium">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-indigo-500 text-white">2</span> Configure
        </div>
        <span class="text-gray-200 text-[10px]">→</span>
        <div class="flex items-center gap-1 text-xs text-gray-400 font-medium">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-[1.5px] border-gray-200 text-gray-400">3</span> Order
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1.5">
      <button @click="store.undo()" class="flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
        <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M3 8L6.5 4.5M3 8L6.5 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Undo
      </button>
      <button @click="store.redo()" class="flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
        Redo
        <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="relative p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
        <svg class="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span v-if="store.cartItems > 0" class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
          {{ store.cartItems }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { CabinetKey } from '~/utils/types';
import { CABINETS, formatDimensions } from '~/utils/constants';
const store = useConfiguratorStore();
</script>
