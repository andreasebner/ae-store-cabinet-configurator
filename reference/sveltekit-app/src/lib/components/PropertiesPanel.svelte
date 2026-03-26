<script lang="ts">
  import { configurator } from '$lib/stores/configurator';

  const { selectedElement, selectedId } = configurator;

  function handleChange(prop: string, e: Event) {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    if (!isNaN(value) && $selectedId) {
      configurator.updateElementProp($selectedId, prop, value);
    }
  }

  function handleDelete() {
    if ($selectedId) configurator.deleteElement($selectedId);
  }
</script>

<div class="p-4 flex flex-col h-full">
  <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Properties</h3>

  {#if $selectedElement}
    <div class="space-y-3">
      <div class="text-sm font-medium capitalize text-slate-700 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full"
          class:bg-amber-400={$selectedElement.type === 'hole'}
          class:bg-sky-400={$selectedElement.type === 'rect'}
          class:bg-emerald-400={$selectedElement.type === 'opening'}
        ></span>
        {$selectedElement.type}
      </div>

      <div class="grid grid-cols-2 gap-2">
        <label class="text-xs text-slate-500">
          X (mm)
          <input
            type="number" step="5" min="0"
            value={$selectedElement.x}
            on:change={(e) => handleChange('x', e)}
            class="w-full mt-0.5 px-2 py-1 text-xs border border-slate-300 rounded"
          />
        </label>
        <label class="text-xs text-slate-500">
          Y (mm)
          <input
            type="number" step="5" min="0"
            value={$selectedElement.y}
            on:change={(e) => handleChange('y', e)}
            class="w-full mt-0.5 px-2 py-1 text-xs border border-slate-300 rounded"
          />
        </label>
        <label class="text-xs text-slate-500">
          Width
          <input
            type="number" step="1" min="5"
            value={$selectedElement.w}
            on:change={(e) => handleChange('w', e)}
            class="w-full mt-0.5 px-2 py-1 text-xs border border-slate-300 rounded"
          />
        </label>
        <label class="text-xs text-slate-500">
          Height
          <input
            type="number" step="1" min="5"
            value={$selectedElement.h}
            on:change={(e) => handleChange('h', e)}
            class="w-full mt-0.5 px-2 py-1 text-xs border border-slate-300 rounded"
          />
        </label>

        {#if $selectedElement.type === 'hole' && $selectedElement.diameter !== undefined}
          <label class="text-xs text-slate-500 col-span-2">
            Diameter (mm)
            <input
              type="number" step="1" min="1"
              value={$selectedElement.diameter}
              on:change={(e) => handleChange('diameter', e)}
              class="w-full mt-0.5 px-2 py-1 text-xs border border-slate-300 rounded"
            />
          </label>
        {/if}
      </div>

      <div class="text-[10px] text-slate-400">
        ID: {$selectedElement.id.slice(0, 8)}…
      </div>

      <button
        class="w-full px-2 py-1.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 mt-2"
        on:click={handleDelete}
      >
        Delete Element
      </button>
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center">
      <p class="text-sm text-slate-400 text-center">Select an element to<br/>view its properties</p>
    </div>
  {/if}
</div>
