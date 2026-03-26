<template>
  <div
    :class="[
      'fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-[10px] text-sm font-medium shadow-md flex items-center gap-2 transition-transform duration-300 z-[1000]',
      store.toastMessage ? 'translate-y-0' : 'translate-y-20'
    ]"
  >
    <span class="text-base">{{ store.toastIcon }}</span>
    <span>{{ store.toastMessage }}</span>
  </div>
</template>

<script setup lang="ts">
const store = useConfiguratorStore();

watch(() => store.toastMessage, (msg) => {
  if (msg) {
    setTimeout(() => store.clearToast(), 2200);
  }
});
</script>
