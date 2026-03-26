<template>
  <div class="d-flex align-center w-100 px-4">
    <!-- Logo / brand -->
    <v-icon icon="mdi-cog-outline" color="primary" size="24" class="mr-2" />
    <span class="text-subtitle-1 font-weight-bold text-primary">Cabinet Configurator</span>

    <v-spacer />

    <!-- Cabinet selector -->
    <v-select
      v-model="store.currentCabinet"
      :items="cabinetItems"
      item-title="title"
      item-value="value"
      density="compact"
      variant="outlined"
      hide-details
      style="max-width:220px"
      class="mr-4"
      @update:model-value="store.setCabinet($event)"
    >
      <template #selection="{ item }">
        <span class="text-body-2">{{ item.raw.title }}</span>
      </template>
    </v-select>

    <!-- Price -->
    <v-chip color="primary" variant="tonal" class="mr-3">
      <v-icon start icon="mdi-currency-eur" size="16" />
      {{ store.price.toFixed(2) }}
    </v-chip>

    <!-- Cart -->
    <v-btn
      color="primary"
      variant="tonal"
      size="small"
      prepend-icon="mdi-cart-outline"
      @click="store.addToCart()"
    >
      Add to Cart
      <v-badge
        v-if="store.cartItems > 0"
        :content="store.cartItems"
        color="error"
        floating
        offset-x="-4"
        offset-y="-4"
      />
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useConfiguratorStore } from '~/stores/configurator';
import { CABINETS } from '~/utils/constants';

const store = useConfiguratorStore();

const cabinetItems = Object.entries(CABINETS).map(([k, v]) => ({
  value: k,
  title: `${v.name} (${v.w}×${v.h}×${v.d} mm)`,
}));
</script>
