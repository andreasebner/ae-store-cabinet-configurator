<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => { goto('/configure'); });
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50">
  <p class="text-slate-400">Loading configurator…</p>
</div>
