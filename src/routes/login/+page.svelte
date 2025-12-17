<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMessage = '';

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      errorMessage = error.message;
    } else {
      goto('/');
    }
  }
</script>

<main class="p-6 max-w-md mx-auto">
  <h1 class="text-2xl mb-4">Login</h1>

  {#if errorMessage}
    <p class="text-red-600 mb-2">{errorMessage}</p>
  {/if}

  <input type="email" placeholder="Email" bind:value={email} class="w-full mb-2 p-2 border" />
  <input type="password" placeholder="Password" bind:value={password} class="w-full mb-2 p-2 border" />

  <button on:click={handleLogin} class="w-full p-2 bg-blue-600 text-white">Login</button>
</main>