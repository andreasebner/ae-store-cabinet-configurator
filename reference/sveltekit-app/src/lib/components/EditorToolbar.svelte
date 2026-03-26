<script lang="ts">
  import { configurator } from '$lib/stores/configurator';
  import type { ToolType } from '$lib/types';

  const { tool, undoStack, redoStack, currentSide } = configurator;

  const tools: { key: ToolType; label: string; icon: string; shortcut: string }[] = [
    { key: 'move', label: 'Move', icon: '↕', shortcut: 'V' },
    { key: 'hole', label: 'Hole', icon: '⬤', shortcut: 'H' },
    { key: 'rect', label: 'Rectangle', icon: '▬', shortcut: 'R' },
    { key: 'opening', label: 'Opening', icon: '▭', shortcut: 'O' },
  ];
</script>

<div class="h-11 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
  <!-- Tools -->
  {#each tools as t}
    <button
      class="px-3 py-1 text-xs rounded-md border transition-colors flex items-center gap-1.5"
      class:bg-blue-600={$tool === t.key}
      class:text-white={$tool === t.key}
      class:border-blue-600={$tool === t.key}
      class:bg-white={$tool !== t.key}
      class:text-slate-600={$tool !== t.key}
      class:border-slate-300={$tool !== t.key}
      class:hover:bg-slate-50={$tool !== t.key}
      on:click={() => configurator.setTool(t.key)}
      title="{t.label} ({t.shortcut})"
    >
      <span>{t.icon}</span>
      <span>{t.label}</span>
    </button>
  {/each}

  <div class="w-px h-6 bg-slate-200 mx-1"></div>

  <!-- Undo / Redo -->
  <button
    class="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30"
    disabled={$undoStack.length === 0}
    on:click={() => configurator.undo()}
    title="Undo (Ctrl+Z)"
  >↩</button>
  <button
    class="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30"
    disabled={$redoStack.length === 0}
    on:click={() => configurator.redo()}
    title="Redo (Ctrl+Y)"
  >↪</button>

  <div class="w-px h-6 bg-slate-200 mx-1"></div>

  <!-- Clear side -->
  <button
    class="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
    on:click={() => configurator.clearCurrentSide()}
  >
    🗑 Clear {$currentSide}
  </button>
</div>
