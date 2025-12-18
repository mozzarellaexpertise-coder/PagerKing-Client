<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  export let data;
  let userEmail: string | null = null;

  // Check session on mount
  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      // Not logged in → redirect to /login
      goto('/login');
    } else {
      userEmail = session.user.email;
    }
  });

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    goto('/login');
  };
</script>

<header class="p-4 bg-gray-800 text-white flex justify-between items-center">
  <h1 class="text-xl font-bold">PagerKing</h1>
  <div class="flex items-center gap-4">
    {#if userEmail}
      <span>{userEmail}</span>
      <button on:click={logout} class="bg-red-600 px-3 py-1 rounded">Logout</button>
    {/if}
  </div>
</header>

<main class="p-6">
  <slot />
</main>
