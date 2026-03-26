<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <AppHeader />
    <div class="flex flex-1 min-h-0">
      <!-- Left: 3D Preview -->
      <div class="flex-1 flex flex-col">
        <Cabinet3DPreview />
        <SidePills />
      </div>

      <div class="w-px bg-gray-200" />

      <!-- Right: 2D Editor -->
      <div class="w-[480px] flex flex-col bg-white">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <h2 class="text-[15px] font-semibold">Panel Editor</h2>
            <span class="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded">
              {{ store.currentSide.toUpperCase() }}
            </span>
          </div>
          <button @click="store.clearCurrentSide()" class="text-[11px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-all">
            Clear All
          </button>
        </div>
        <EditorToolbar />
        <PanelEditor />
        <PropertiesPanel />
        <ElementList />
        <EditorFooter />
      </div>
    </div>
    <AppToast />
  </div>
</template>

<script setup lang="ts">
const store = useConfiguratorStore();
useKeyboardShortcuts();
</script>
