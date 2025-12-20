<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/login', { replaceState: true });
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <h1 class="text-4xl font-bold text-gray-800">PagerKing 🦏</h1>
  <p class="text-gray-500 mt-2">Redirecting to login...</p>
</div>