<script lang="ts">
  import { onMount } from 'svelte';
  import { getCurrentUser } from '$lib/api';
  import { goto } from '$app/navigation';

  let user: { id: string; email: string; role?: string } | null = null;
  let loading = true;

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();

      if (!res.ok) {
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        await goto('/login', { replaceState: true });
        return;
      }

      user = res.user;
    } catch (err) {
      console.error('Error fetching user:', err);
      await goto('/login', { replaceState: true });
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    fetchUser();
  });
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
  <h1 class="text-4xl font-bold mb-4">PagerKing 🦏</h1>

  {#if loading}
    <p class="text-gray-500">Loading your session...</p>
  {:else if user}
    <p class="text-lg text-gray-700">Welcome {user.email}</p>
  {/if}
</div>