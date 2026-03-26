<template>
  <v-toolbar density="compact" flat class="border-t px-3">
    <v-icon icon="mdi-information-outline" size="16" class="mr-2 text-grey" />
    <span class="text-caption text-grey">
      {{ store.currentElements.length }} element{{ store.currentElements.length !== 1 ? 's' : '' }} ·
      Grid {{ SNAP_GRID }}mm ·
      Zoom {{ Math.round(store.zoomLevel * 100) }}%
    </span>
    <v-spacer />
    <span class="text-caption text-grey-darken-1">
      <kbd class="text-caption">V</kbd> Hole
      <kbd class="text-caption ml-2">H</kbd> Rect
      <kbd class="text-caption ml-2">O</kbd> Opening
      <kbd class="text-caption ml-2">M</kbd> Move
      <kbd class="text-caption ml-2">Del</kbd> Delete
    </span>
  </v-toolbar>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';
import { SNAP_GRID } from '~/utils/constants';
const store = useConfiguratorStore();
</script>

<style scoped>
kbd {
  background: rgba(0,0,0,0.06);
  border-radius: 3px;
  padding: 1px 4px;
  font-family: inherit;
}
</style>
