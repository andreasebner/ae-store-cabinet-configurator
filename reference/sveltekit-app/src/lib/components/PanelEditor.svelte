<script lang="ts">
  import { configurator } from '$lib/stores/configurator';
  import { getPanelDimensions, snap, ELEMENT_DEFAULTS, SNAP_GRID } from '$lib/constants';
  import type { ElementType, PanelElement } from '$lib/types';
  import { get } from 'svelte/store';

  const { cabinet, currentSide, tool, zoom, selectedId, currentElements } = configurator;

  let panelEl: HTMLDivElement;
  let dragging: { id: string; offsetX: number; offsetY: number } | null = null;

  $: dims = getPanelDimensions($cabinet, $currentSide);
  $: pw = dims.pw;
  $: ph = dims.ph;

  function handlePanelClick(e: MouseEvent) {
    const t = get(tool);
    if (t === 'move') {
      configurator.selectElement(null);
      return;
    }
    // Place element
    const rect = panelEl.getBoundingClientRect();
    const z = get(zoom);
    const x = snap((e.clientX - rect.left) / z);
    const y = snap((e.clientY - rect.top) / z);
    const defaults = ELEMENT_DEFAULTS[t as ElementType];
    const el: PanelElement = {
      id: crypto.randomUUID(),
      type: t as ElementType,
      x: Math.max(0, Math.min(x - defaults.w / 2, pw - defaults.w)),
      y: Math.max(0, Math.min(y - defaults.h / 2, ph - defaults.h)),
      w: defaults.w,
      h: defaults.h,
      ...(t === 'hole' ? { diameter: defaults.diameter } : {}),
    };
    configurator.addElement(el);
  }

  function handleElementMouseDown(e: MouseEvent, el: PanelElement) {
    e.stopPropagation();
    configurator.selectElement(el.id);
    const rect = panelEl.getBoundingClientRect();
    const z = get(zoom);
    dragging = {
      id: el.id,
      offsetX: (e.clientX - rect.left) / z - el.x,
      offsetY: (e.clientY - rect.top) / z - el.y,
    };

    function onMouseMove(ev: MouseEvent) {
      if (!dragging) return;
      const r = panelEl.getBoundingClientRect();
      const z = get(zoom);
      const found = get(currentElements).find(e => e.id === dragging!.id);
      if (!found) return;
      const nx = snap((ev.clientX - r.left) / z - dragging.offsetX);
      const ny = snap((ev.clientY - r.top) / z - dragging.offsetY);
      const cx = Math.max(0, Math.min(nx, pw - found.w));
      const cy = Math.max(0, Math.min(ny, ph - found.h));
      configurator.moveElement(dragging.id, cx, cy);
    }

    function onMouseUp() {
      dragging = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function getElementClass(type: string): string {
    switch (type) {
      case 'hole': return 'bg-amber-400/80 rounded-full border-2 border-amber-600';
      case 'rect': return 'bg-sky-400/60 border-2 border-sky-600';
      case 'opening': return 'bg-emerald-400/60 border-2 border-emerald-600 rounded-sm';
      default: return '';
    }
  }
</script>

<div class="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-8"
  role="application"
  aria-label="Panel editor"
>
  <div
    class="relative bg-white shadow-lg border-2 border-slate-300"
    style="width:{pw * $zoom}px; height:{ph * $zoom}px; background-image: radial-gradient(circle, #ddd 1px, transparent 1px); background-size: {SNAP_GRID * $zoom}px {SNAP_GRID * $zoom}px;"
    bind:this={panelEl}
    on:click={handlePanelClick}
    role="presentation"
  >
    <!-- Grid lines (major = every 50mm) -->
    {#each Array(Math.floor(pw / 50)) as _, i}
      <div
        class="absolute top-0 bottom-0 w-px bg-slate-200 pointer-events-none"
        style="left:{(i + 1) * 50 * $zoom}px"
      ></div>
    {/each}
    {#each Array(Math.floor(ph / 50)) as _, i}
      <div
        class="absolute left-0 right-0 h-px bg-slate-200 pointer-events-none"
        style="top:{(i + 1) * 50 * $zoom}px"
      ></div>
    {/each}

    <!-- Dimension labels -->
    <span
      class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400"
    >{pw} mm</span>
    <span
      class="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-slate-400"
    >{ph} mm</span>

    <!-- Elements -->
    {#each $currentElements as el (el.id)}
      <div
        class="panel-el absolute cursor-move flex items-center justify-center text-[9px] text-white font-bold select-none {getElementClass(el.type)}"
        class:ring-2={$selectedId === el.id}
        class:ring-blue-500={$selectedId === el.id}
        class:ring-offset-1={$selectedId === el.id}
        style="left:{el.x * $zoom}px; top:{el.y * $zoom}px; width:{el.w * $zoom}px; height:{el.h * $zoom}px;"
        on:mousedown={(e) => handleElementMouseDown(e, el)}
        role="button"
        tabindex="0"
      >
        {el.type === 'hole' ? '⬤' : el.type === 'rect' ? '▬' : '▭'}

        <!-- Resize handles when selected -->
        {#if $selectedId === el.id}
          <div class="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-blue-500 rounded-sm cursor-se-resize"></div>
        {/if}
      </div>
    {/each}
  </div>
</div>
