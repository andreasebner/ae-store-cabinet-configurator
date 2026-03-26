<template>
  <div class="flex items-center gap-0.5 px-4 py-2 border-b border-gray-100">
    <!-- Select -->
    <button :title="'Select (V)'" @click="store.setTool('select')"
      :class="toolBtnClass('select')">
      <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><path d="M3 2L3 12L6.5 8.5L10 12L12 10L8.5 6.5L12.5 3L3 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
    </button>
    <div class="w-px h-5 bg-gray-100 mx-1" />
    <span class="text-[10px] text-gray-400 mx-1 font-semibold uppercase tracking-wider">Add</span>
    <!-- Hole -->
    <button title="Round Hole (H)" @click="store.setTool('hole')" :class="toolBtnClass('hole')">
      <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/></svg>
    </button>
    <!-- Rect -->
    <button title="Rect Hole (R)" @click="store.setTool('rect')" :class="toolBtnClass('rect')">
      <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><rect x="3" y="4" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>
    </button>
    <!-- Opening -->
    <button title="Cable Opening (O)" @click="store.setTool('opening')" :class="toolBtnClass('opening')">
      <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><rect x="3" y="4" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/></svg>
    </button>
    <div class="w-px h-5 bg-gray-100 mx-1" />
    <!-- Measure -->
    <button title="Measure (M)" @click="store.setTool('measure')" :class="toolBtnClass('measure')">
      <svg viewBox="0 0 16 16" fill="none" class="w-4 h-4"><line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="11" x2="2" y2="15" stroke="currentColor" stroke-width="1.5"/><line x1="14" y1="11" x2="14" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ToolType } from '~/utils/types';
const store = useConfiguratorStore();

function toolBtnClass(tool: ToolType) {
  return [
    'w-8 h-8 rounded-md flex items-center justify-center transition-all',
    store.activeTool === tool
      ? 'bg-indigo-500 text-white'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
  ];
}
</script>
