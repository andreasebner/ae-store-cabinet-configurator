<template>
  <div class="d-flex flex-column align-center ga-1">
    <v-btn
      v-for="side in SIDES"
      :key="side"
      :color="store.currentSide === side ? 'primary' : undefined"
      :variant="store.currentSide === side ? 'flat' : 'text'"
      size="small"
      min-width="52"
      @click="store.setSide(side)"
    >
      <v-icon :icon="icons[side]" size="16" class="mr-1" />
      <span class="text-caption text-capitalize">{{ side }}</span>
      <v-badge
        v-if="store.sideHasEdits(side)"
        dot
        color="accent"
        floating
        offset-x="-2"
        offset-y="-2"
      />
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';
import { SIDES } from '~/utils/constants';
import type { Side } from '~/utils/types';

const store = useConfiguratorStore();

const icons: Record<Side, string> = {
  front: 'mdi-square-outline',
  back: 'mdi-square-outline',
  left: 'mdi-arrow-left-bold-box-outline',
  right: 'mdi-arrow-right-bold-box-outline',
  top: 'mdi-arrow-up-bold-box-outline',
  bottom: 'mdi-arrow-down-bold-box-outline',
};
</script>
