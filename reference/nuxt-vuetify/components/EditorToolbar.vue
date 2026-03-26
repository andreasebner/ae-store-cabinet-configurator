<template>
  <v-toolbar density="compact" flat class="border-b px-2">
    <v-btn-toggle
      :model-value="store.activeTool"
      mandatory
      density="compact"
      color="primary"
      variant="outlined"
      divided
      @update:model-value="store.setTool($event)"
    >
      <v-btn v-for="t in tools" :key="t.value" :value="t.value" size="small">
        <v-icon :icon="t.icon" size="18" class="mr-1" />
        <span class="text-caption">{{ t.label }}</span>
      </v-btn>
    </v-btn-toggle>

    <v-spacer />

    <v-btn icon size="small" variant="text" :disabled="!store.undoStack.length" @click="store.undo()">
      <v-icon icon="mdi-undo" />
      <v-tooltip activator="parent" location="bottom">Undo (Ctrl+Z)</v-tooltip>
    </v-btn>
    <v-btn icon size="small" variant="text" :disabled="!store.redoStack.length" @click="store.redo()">
      <v-icon icon="mdi-redo" />
      <v-tooltip activator="parent" location="bottom">Redo (Ctrl+Y)</v-tooltip>
    </v-btn>

    <v-divider vertical class="mx-2" />

    <v-btn icon size="small" variant="text" @click="store.setZoom(store.zoomLevel + 0.1)">
      <v-icon icon="mdi-magnify-plus-outline" />
    </v-btn>
    <span class="text-caption mx-1">{{ Math.round(store.zoomLevel * 100) }}%</span>
    <v-btn icon size="small" variant="text" @click="store.setZoom(store.zoomLevel - 0.1)">
      <v-icon icon="mdi-magnify-minus-outline" />
    </v-btn>

    <v-divider vertical class="mx-2" />

    <v-btn
      size="small"
      variant="text"
      color="warning"
      prepend-icon="mdi-delete-sweep-outline"
      @click="store.clearCurrentSide()"
    >
      Clear Side
    </v-btn>
  </v-toolbar>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';

const store = useConfiguratorStore();

const tools = [
  { value: 'hole', icon: 'mdi-circle-outline', label: 'Hole (V)' },
  { value: 'rect', icon: 'mdi-rectangle-outline', label: 'Rect (H)' },
  { value: 'opening', icon: 'mdi-square-rounded-outline', label: 'Opening (O)' },
  { value: 'move', icon: 'mdi-cursor-move', label: 'Move (M)' },
];
</script>
