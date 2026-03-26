<script lang="ts">
  import { configurator } from '$lib/stores/configurator';
  import { fly } from 'svelte/transition';

  const { toast } = configurator;

  const bgMap: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };
</script>

{#if $toast}
  <div
    class="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg text-white text-sm shadow-lg {bgMap[$toast.type] || bgMap.info}"
    transition:fly={{ y: 30, duration: 250 }}
  >
    {$toast.message}
  </div>
{/if}
