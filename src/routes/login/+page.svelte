<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let errorMsg = '';

  // If user is already logged in, redirect to /app
  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.location.href = '/app';
    }
  });

  const handleLogin = async () => {
    errorMsg = '';

    if (!email || !password) {
      errorMsg = 'Please enter both email and password';
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error.message);
      errorMsg = error.message;
      return;
    }

    console.log('Logged in!', data);
    window.location.href = '/app';
  };
</script>

<style>
  .container { max-width: 400px; margin: 5rem auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px; }
  input { width: 100%; padding: 0.5rem; margin-bottom: 1rem; border-radius: 4px; border: 1px solid #ccc; }
  button { width: 100%; padding: 0.75rem; background-color: #1d4ed8; color: white; border: none; border-radius: 4px; cursor: pointer; }
  button:hover { background-color: #2563eb; }
  .error { color: red; margin-bottom: 1rem; }
</style>

<div class="container">
  <h2 class="text-2xl font-bold mb-4">PagerKing Login</h2>

  {#if errorMsg}
    <div class="error">{errorMsg}</div>
  {/if}

  <input type="email" placeholder="Email" bind:value={email} />
  <input type="password" placeholder="Password" bind:value={password} />
  <button on:click={handleLogin}>Login</button>
</div>
