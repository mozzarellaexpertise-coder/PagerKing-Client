<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/api';

  let email = '';
  let password = '';
  let error = '';

  const doLogin = async () => {
    error = '';

    const res = await login(email, password);

    if (!res.ok) {
      error = res.error || 'Login failed';
      return;
    }

    goto('/app');
  };
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="w-full max-w-sm border p-6 rounded shadow">
    <h1 class="text-2xl font-bold mb-4 text-center">PagerKing Login 🦏</h1>

    {#if error}
      <p class="text-red-600 mb-2">{error}</p>
    {/if}

    <input
      class="w-full border p-2 mb-2 rounded"
      placeholder="Email"
      bind:value={email}
    />

    <input
      class="w-full border p-2 mb-4 rounded"
      type="password"
      placeholder="Password"
      bind:value={password}
    />

    <button
      class="w-full bg-blue-600 text-white p-2 rounded"
      on:click={doLogin}
    >
      Login
    </button>
  </div>
</div>