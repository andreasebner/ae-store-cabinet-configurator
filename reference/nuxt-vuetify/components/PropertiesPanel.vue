<template>
  <v-card flat class="pa-3 flex-shrink-0" style="min-height:180px">
    <v-card-subtitle class="px-0 pb-2 text-overline">Properties</v-card-subtitle>

    <template v-if="el">
      <v-chip size="small" :color="typeColor" variant="tonal" class="mb-3 text-capitalize">
        <v-icon start :icon="typeIcon" size="14" />
        {{ el.type }}
      </v-chip>

      <v-row dense>
        <v-col cols="6">
          <v-text-field
            :model-value="el.x"
            label="X (mm)"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="upd('x', +$event)"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            :model-value="el.y"
            label="Y (mm)"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="upd('y', +$event)"
          />
        </v-col>
        <template v-if="el.type === 'hole'">
          <v-col cols="12">
            <v-text-field
              :model-value="el.diameter"
              label="Diameter (mm)"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="upd('diameter', +$event)"
            />
          </v-col>
        </template>
        <template v-else>
          <v-col cols="6">
            <v-text-field
              :model-value="el.w"
              label="Width (mm)"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="upd('w', +$event)"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              :model-value="el.h"
              label="Height (mm)"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="upd('h', +$event)"
            />
          </v-col>
        </template>
      </v-row>

      <v-btn
        color="error"
        variant="tonal"
        size="small"
        block
        class="mt-3"
        prepend-icon="mdi-delete-outline"
        @click="store.deleteElement(el.id)"
      >
        Delete Element
      </v-btn>
    </template>

    <div v-else class="d-flex flex-column align-center justify-center text-center" style="height:100px">
      <v-icon icon="mdi-cursor-default-click-outline" size="32" color="grey-lighten-1" />
      <span class="text-caption text-grey mt-2">Select an element to edit</span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';

const store = useConfiguratorStore();

const el = computed(() =>
  store.selectedElId !== null
    ? store.sideElements[store.currentSide].find(e => e.id === store.selectedElId) ?? null
    : null
);

const typeColor = computed(() =>
  el.value?.type === 'hole' ? 'primary' : el.value?.type === 'rect' ? 'accent' : 'warning'
);
const typeIcon = computed(() =>
  el.value?.type === 'hole' ? 'mdi-circle-outline' : el.value?.type === 'rect' ? 'mdi-rectangle-outline' : 'mdi-square-rounded-outline'
);

function upd(prop: string, val: number) {
  if (el.value) store.updateElementProp(el.value.id, prop, val);
}
</script>
