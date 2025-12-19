<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  const SERVER_BASE = 'https://pagerking.vercel.app/api';

  onMount(async () => {
    try {
      const res = await fetch(`${SERVER_BASE}/currentUser`, { credentials: 'include' });
      const data = await res.json();

      if (data.ok && data.user) {
        // If logged in, go straight to chat
        goto('/app');
      }
    } catch (err) {
      console.error('Could not check current user:', err);
    }
  });
</script>

<div class="flex flex-col items-center justify-center h-screen">
  <h1 class="text-4xl font-bold mb-4">Welcome to PagerKing 🦏</h1>
  <p class="text-gray-600">Please log in to start chatting.</p>
</div>