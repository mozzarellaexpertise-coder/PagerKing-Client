<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  export let data;

  const logout = async () => {
    await supabase.auth.signOut();
    location.href = '/login';
  };
</script>

<header class="p-4 bg-gray-800 text-white flex justify-between items-center">
  <h1 class="text-xl font-bold">PagerKing</h1>
  <div class="flex items-center gap-4">
    <span>{data.session?.user.email}</span>
    <button on:click={logout} class="bg-red-600 px-3 py-1 rounded">Logout</button>
  </div>
</header>

<main class="p-6">
  <slot />
</main>
