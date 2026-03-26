<template>
  <v-snackbar
    :model-value="!!store.toastMessage"
    :color="store.toastColor"
    timeout="2500"
    location="bottom right"
    @update:model-value="store.clearToast()"
  >
    <v-icon :icon="store.toastIcon" class="mr-2" />
    {{ store.toastMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';
const store = useConfiguratorStore();
</script>
