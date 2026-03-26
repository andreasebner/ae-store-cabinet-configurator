<template>
  <div>
    <NuxtLink to="/configure" class="text-indigo-500">Go to Configurator</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ redirect: '/configure' });
navigateTo('/configure');
</script>
