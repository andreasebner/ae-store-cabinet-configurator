<script lang="ts">
  import { configurator } from '$lib/stores/configurator';

  const { currentElements, selectedId, currentSide } = configurator;
</script>

<div class="flex-1 overflow-auto p-4">
  <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
    Elements — <span class="capitalize">{$currentSide}</span>
    <span class="text-slate-400 ml-1">({$currentElements.length})</span>
  </h3>

  {#if $currentElements.length === 0}
    <p class="text-xs text-slate-400 mt-2">No elements on this side.<br/>Select a tool and click on the panel.</p>
  {:else}
    <ul class="space-y-1">
      {#each $currentElements as el (el.id)}
        <li>
          <button
            class="w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors"
            class:bg-blue-50={$selectedId === el.id}
            class:text-blue-700={$selectedId === el.id}
            class:hover:bg-slate-50={$selectedId !== el.id}
            class:text-slate-600={$selectedId !== el.id}
            on:click={() => configurator.selectElement(el.id)}
          >
            <span class="w-2 h-2 rounded-full shrink-0"
              class:bg-amber-400={el.type === 'hole'}
              class:bg-sky-400={el.type === 'rect'}
              class:bg-emerald-400={el.type === 'opening'}
            ></span>
            <span class="capitalize font-medium">{el.type}</span>
            <span class="text-slate-400 ml-auto">{el.x},{el.y}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
