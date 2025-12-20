<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getCurrentUser } from '$lib/api';

  let user: { id: string; email: string; role?: string } | null = null;
  let loading = true;

  // Bulletproof function to fetch current user
  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();

      if (!res.ok) {
        // Token missing or invalid — clean up
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        goto('/login');
        return;
      }

      user = res.user;
    } catch (err) {
      console.error('Error fetching current user:', err);
      goto('/login');
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