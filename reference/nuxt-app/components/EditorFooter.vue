<template>
  <div class="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
    <div>
      <div class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Configured Price</div>
      <div class="text-[22px] font-bold text-gray-900 tracking-tight">€ {{ store.price.toFixed(2) }}</div>
    </div>
    <button @click="store.addToCart()"
      class="px-6 py-2.5 text-sm font-semibold rounded-[10px] bg-indigo-500 text-white flex items-center gap-1.5 shadow-[0_2px_8px_rgba(99,102,241,0.25)] hover:bg-indigo-600 hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:-translate-y-px transition-all">
      <svg class="w-4 h-4" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Add to Cart
    </button>
  </div>
</template>

<script setup lang="ts">
const store = useConfiguratorStore();
</script>
