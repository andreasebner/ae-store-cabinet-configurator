<template>
  <div class="px-4 pb-3">
    <div class="flex gap-1.5 justify-center">
      <button
        v-for="side in SIDES" :key="side"
        @click="store.setSide(side)"
        :class="[
          'relative px-3.5 py-1 rounded-full text-xs font-medium border transition-all',
          side === store.currentSide
            ? 'bg-indigo-500 border-indigo-500 text-white'
            : 'bg-white/70 backdrop-blur-sm border-gray-200 text-gray-500 hover:border-indigo-500 hover:text-indigo-500'
        ]"
      >
        {{ side.charAt(0).toUpperCase() + side.slice(1) }}
        <span
          v-if="store.sideElements[side].length > 0"
          class="absolute -top-0.5 -right-0.5 w-[5px] h-[5px] bg-amber-500 rounded-full border-[1.5px] border-white"
        />
      </button>
    </div>
    <p class="text-center pt-1 pb-1 text-[11px] text-gray-400">Click a side or drag to rotate</p>
  </div>
</template>

<script setup lang="ts">
import { SIDES } from '~/utils/constants';
const store = useConfiguratorStore();
</script>
