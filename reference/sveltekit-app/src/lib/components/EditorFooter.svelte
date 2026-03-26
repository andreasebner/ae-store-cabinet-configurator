<script lang="ts">
  import { configurator } from '$lib/stores/configurator';
  import { formatDimensions, CABINETS } from '$lib/constants';

  const { cabinet, currentSide, zoom, currentElements } = configurator;

  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];
</script>

<div class="h-9 bg-white border-t border-slate-200 flex items-center px-4 justify-between text-xs text-slate-500 shrink-0">
  <div class="flex items-center gap-4">
    <span>{CABINETS[$cabinet].label}</span>
    <span class="text-slate-300">|</span>
    <span class="capitalize">{$currentSide}</span>
    <span class="text-slate-300">|</span>
    <span>{formatDimensions($cabinet)}</span>
    <span class="text-slate-300">|</span>
    <span>{$currentElements.length} element{$currentElements.length !== 1 ? 's' : ''}</span>
  </div>

  <div class="flex items-center gap-2">
    <span>Zoom</span>
    <select
      class="border border-slate-300 rounded px-1 py-0.5 text-xs"
      value={$zoom}
      on:change={(e) => configurator.setZoom(Number((e.target).value))}
    >
      {#each zoomLevels as z}
        <option value={z}>{Math.round(z * 100)}%</option>
      {/each}
    </select>
  </div>
</div>
