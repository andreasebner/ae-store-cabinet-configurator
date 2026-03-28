<template>
  <div class="app-layout">
    <div class="viewport-panel">
      <ThreeViewport />
    </div>
    <div class="editor-panel">
      <PanelEditor />
    </div>
  </div>
</template>

<script setup>
import ThreeViewport from './components/ThreeViewport.vue';
import PanelEditor from './components/PanelEditor.vue';
</script>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100%;
}
.viewport-panel {
  flex: 6;
  position: relative;
  background: #1a1a2e;
}
.editor-panel {
  flex: 4;
  position: relative;
  background: #f0f0f0;
  border-left: 2px solid #ccc;
  display: flex;
  flex-direction: column;
}
</style>
