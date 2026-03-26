<script lang="ts">
  import { configurator } from '$lib/stores/configurator';
  import { CABINETS, SIDE_ROTATIONS, SIDES } from '$lib/constants';

  const { cabinet, currentSide } = configurator;

  $: cab = CABINETS[$cabinet];
  $: scale = Math.min(180 / cab.w, 140 / cab.h, 180 / cab.d);
  $: sw = cab.w * scale;
  $: sh = cab.h * scale;
  $: sd = cab.d * scale;
  $: transform = SIDE_ROTATIONS[$currentSide];
</script>

<div class="p-4 border-b border-slate-200">
  <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">3D Preview</h3>
  <div class="h-48 perspective-[600px] flex items-center justify-center">
    <div
      class="relative preserve-3d transition-transform duration-500"
      style="width:{sw}px; height:{sh}px; transform: {transform}"
    >
      <!-- Front -->
      <div
        class="face absolute bg-blue-100/80 border border-blue-300"
        class:ring-2={$currentSide === 'front'}
        class:ring-blue-500={$currentSide === 'front'}
        style="width:{sw}px; height:{sh}px; transform: translateZ({sd / 2}px)"
      >
        <span class="absolute inset-0 flex items-center justify-center text-[10px] text-blue-400">Front</span>
      </div>
      <!-- Back -->
      <div
        class="face absolute bg-blue-100/60 border border-blue-300"
        class:ring-2={$currentSide === 'back'}
        class:ring-blue-500={$currentSide === 'back'}
        style="width:{sw}px; height:{sh}px; transform: rotateY(180deg) translateZ({sd / 2}px)"
      >
        <span class="absolute inset-0 flex items-center justify-center text-[10px] text-blue-400">Back</span>
      </div>
      <!-- Left -->
      <div
        class="face absolute bg-blue-200/60 border border-blue-300"
        class:ring-2={$currentSide === 'left'}
        class:ring-blue-500={$currentSide === 'left'}
        style="width:{sd}px; height:{sh}px; transform: rotateY(-90deg) translateZ(0px)"
      >
        <span class="absolute inset-0 flex items-center justify-center text-[10px] text-blue-400">Left</span>
      </div>
      <!-- Right -->
      <div
        class="face absolute bg-blue-200/60 border border-blue-300"
        class:ring-2={$currentSide === 'right'}
        class:ring-blue-500={$currentSide === 'right'}
        style="width:{sd}px; height:{sh}px; transform: rotateY(90deg) translateZ({sw}px)"
      >
        <span class="absolute inset-0 flex items-center justify-center text-[10px] text-blue-400">Right</span>
      </div>
      <!-- Top -->
      <div
        class="face absolute bg-blue-50/60 border border-blue-300"
        class:ring-2={$currentSide === 'top'}
        class:ring-blue-500={$currentSide === 'top'}
        style="width:{sw}px; height:{sd}px; transform: rotateX(90deg) translateZ(0px)"
      >
        <span class="absolute inset-0 flex items-center justify-center text-[10px] text-blue-400">Top</span>
      </div>
      <!-- Bottom -->
      <div
        class="face absolute bg-blue-50/60 border border-blue-300"
        class:ring-2={$currentSide === 'bottom'}
        class:ring-blue-500={$currentSide === 'bottom'}
        style="width:{sw}px; height:{sd}px; transform: rotateX(-90deg) translateZ({sh}px)"
      >
        <span class="absolute inset-0 flex items-center justify-center text-[10px] text-blue-400">Bottom</span>
      </div>
    </div>
  </div>
</div>

<style>
  .preserve-3d { transform-style: preserve-3d; }
</style>
