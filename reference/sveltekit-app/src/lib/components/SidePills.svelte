<script lang="ts">
  import { configurator } from '$lib/stores/configurator';
  import { SIDES } from '$lib/constants';
  import type { Side } from '$lib/types';

  const { currentSide, sideElements } = configurator;

  function count(side: Side): number {
    return ($sideElements[side] || []).length;
  }
</script>

<div class="p-4 border-b border-slate-200">
  <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sides</h3>
  <div class="flex flex-wrap gap-1.5">
    {#each SIDES as side}
      <button
        class="px-3 py-1.5 text-xs rounded-full border font-medium transition-colors capitalize"
        class:bg-blue-600={$currentSide === side}
        class:text-white={$currentSide === side}
        class:border-blue-600={$currentSide === side}
        class:bg-white={$currentSide !== side}
        class:text-slate-600={$currentSide !== side}
        class:border-slate-300={$currentSide !== side}
        class:hover:bg-slate-50={$currentSide !== side}
        on:click={() => configurator.setSide(side)}
      >
        {side}
        {#if count(side) > 0}
          <span
            class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px]"
            class:bg-blue-500={$currentSide === side}
            class:text-white={$currentSide === side}
            class:bg-slate-200={$currentSide !== side}
            class:text-slate-600={$currentSide !== side}
          >
            {count(side)}
          </span>
        {/if}
      </button>
    {/each}
  </div>
</div>
