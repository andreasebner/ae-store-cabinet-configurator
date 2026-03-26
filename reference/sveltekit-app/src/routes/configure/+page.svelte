<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { configurator } from '$lib/stores/configurator';
  import AppHeader from '$lib/components/AppHeader.svelte';
  import Cabinet3DPreview from '$lib/components/Cabinet3DPreview.svelte';
  import SidePills from '$lib/components/SidePills.svelte';
  import EditorToolbar from '$lib/components/EditorToolbar.svelte';
  import PanelEditor from '$lib/components/PanelEditor.svelte';
  import PropertiesPanel from '$lib/components/PropertiesPanel.svelte';
  import ElementList from '$lib/components/ElementList.svelte';
  import EditorFooter from '$lib/components/EditorFooter.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { ELEMENT_DEFAULTS, snap,  getPanelDimensions } from '$lib/constants';
  import { get } from 'svelte/store';

  const { tool, currentSide, cabinet, selectedId } = configurator;

  function handleKeydown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') { e.preventDefault(); configurator.undo(); }
      if (e.key === 'y') { e.preventDefault(); configurator.redo(); }
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'v': case 'm': configurator.setTool('move'); break;
      case 'h': configurator.setTool('hole'); break;
      case 'r': configurator.setTool('rect'); break;
      case 'o': configurator.setTool('opening'); break;
      case 'delete': case 'backspace': {
        const sel = get(selectedId);
        if (sel) configurator.deleteElement(sel);
        break;
      }
    }
  }

  onMount(() => { window.addEventListener('keydown', handleKeydown); });
  onDestroy(() => { if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown); });
</script>

<svelte:head>
  <title>Cabinet Configurator — SvelteKit</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50">
  <AppHeader />

  <main class="flex-1 flex overflow-hidden">
    <!-- Left sidebar: 3D Preview + Side Pills -->
    <aside class="w-72 border-r border-slate-200 bg-white flex flex-col">
      <Cabinet3DPreview />
      <SidePills />
      <ElementList />
    </aside>

    <!-- Center: Toolbar + Panel Editor -->
    <section class="flex-1 flex flex-col">
      <EditorToolbar />
      <PanelEditor />
      <EditorFooter />
    </section>

    <!-- Right sidebar: Properties -->
    <aside class="w-72 border-l border-slate-200 bg-white">
      <PropertiesPanel />
    </aside>
  </main>

  <Toast />
</div>
