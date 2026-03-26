<template>
  <div class="flex-grow-1 overflow-y-auto pa-3">
    <v-card-subtitle class="px-0 pb-2 text-overline">
      Elements · {{ store.currentSide }}
      <v-chip size="x-small" class="ml-1">{{ elements.length }}</v-chip>
    </v-card-subtitle>

    <v-list v-if="elements.length" density="compact" class="pa-0">
      <v-list-item
        v-for="el in elements"
        :key="el.id"
        :active="el.id === store.selectedElId"
        color="primary"
        rounded
        class="mb-1"
        @click="store.selectElement(el.id)"
      >
        <template #prepend>
          <v-icon :icon="icon(el.type)" size="18" />
        </template>
        <v-list-item-title class="text-body-2 text-capitalize">
          {{ el.type }}
          <span class="text-grey text-caption ml-1">
            {{ el.type === 'hole' ? `⌀${el.diameter}` : `${el.w}×${el.h}` }}
          </span>
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          ({{ el.x }}, {{ el.y }}) mm
        </v-list-item-subtitle>
        <template #append>
          <v-btn icon size="x-small" variant="text" color="error" @click.stop="store.deleteElement(el.id)">
            <v-icon icon="mdi-close" size="14" />
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <div v-else class="d-flex flex-column align-center justify-center text-center" style="height:120px">
      <v-icon icon="mdi-package-variant" size="36" color="grey-lighten-1" />
      <span class="text-caption text-grey mt-2">No elements on this side</span>
      <span class="text-caption text-grey">Click on the panel to add</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';
import type { ElementType } from '~/utils/types';

const store = useConfiguratorStore();
const elements = computed(() => store.sideElements[store.currentSide]);

function icon(type: ElementType) {
  return type === 'hole' ? 'mdi-circle-outline' : type === 'rect' ? 'mdi-rectangle-outline' : 'mdi-square-rounded-outline';
}
</script>
