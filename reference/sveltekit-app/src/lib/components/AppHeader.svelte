<script lang="ts">
  import { configurator } from '$lib/stores/configurator';
  import { CABINETS, calcPrice } from '$lib/constants';
  import type { CabinetKey } from '$lib/types';

  const { cabinet, sideElements, cartItems } = configurator;

  let showCabinetSelect = false;

  function selectCabinet(key: CabinetKey) {
    configurator.setCabinet(key);
    showCabinetSelect = false;
  }
</script>

<header class="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
  <div class="flex items-center gap-3">
    <span class="font-bold text-lg text-blue-600">⚡ Cabinet Configurator</span>
    <span class="text-xs text-slate-400">SvelteKit</span>
  </div>

  <div class="flex items-center gap-4">
    <!-- Cabinet selector -->
    <div class="relative">
      <button
        class="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2"
        on:click={() => showCabinetSelect = !showCabinetSelect}
      >
        <span class="font-medium">{CABINETS[$cabinet].label}</span>
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
      </button>

      {#if showCabinetSelect}
        <div class="absolute top-full mt-1 right-0 bg-white shadow-lg rounded-lg border border-slate-200 py-1 z-50 w-56">
          {#each Object.entries(CABINETS) as [key, spec]}
            <button
              class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex justify-between items-center"
              class:bg-blue-50={$cabinet === key}
              on:click={() => selectCabinet(key)}
            >
              <span>{spec.label}</span>
              <span class="text-slate-400 text-xs">{spec.w}×{spec.h}×{spec.d}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Price -->
    <span class="font-semibold text-green-700">
      €{calcPrice($cabinet, $sideElements).toFixed(2)}
    </span>

    <!-- Add to cart -->
    <button
      class="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      on:click={() => configurator.addToCart()}
    >
      🛒 Add to Cart ({$cartItems.length})
    </button>
  </div>
</header>
