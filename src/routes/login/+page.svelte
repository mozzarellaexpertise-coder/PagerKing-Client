<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/api';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  const doLogin = async () => {
    if (!email || !password) {
      error = 'Please enter both email and password';
      return;
    }

    error = '';
    loading = true;

    try {
      const res = await login(email, password);

      // Check if the server returned the session correctly
      if (res.ok && res.session?.access_token) {
        // 1. Store the JWT for the Bearer token auth we set up in lib/api.ts
        localStorage.setItem('sb-access-token', res.session.access_token);
        
        // 2. Store the refresh token so we can stay logged in later
        if (res.session.refresh_token) {
          localStorage.setItem('sb-refresh-token', res.session.refresh_token);
        }

        // 3. Move to the protected app area
        goto('/app');
      } else {
        error = res.error || 'Login failed. Please check your credentials.';
      }
    } catch (err) {
      console.error('Login error:', err);
      error = 'Could not connect to the server. Check your internet or API URL.';
    } finally {
      loading = false;
    }
  };
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div class="w-full max-w-sm bg-white border p-8 rounded-lg shadow-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">PagerKing 🦏</h1>
      <p class="text-gray-500 mt-2">Sign in to your account</p>
    </div>

    {#if error}
      <div class="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
        <p class="text-red-700 text-sm">{error}</p>
      </div>
    {/if}

    <div class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          type="email"
          class="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="you@example.com"
          bind:value={email}
          disabled={loading}
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          id="password"
          class="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          type="password"
          placeholder="••••••••"
          bind:value={password}
          disabled={loading}
          on:keydown={(e) => e.key === 'Enter' && doLogin()}
        />
      </div>

      <button
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded transition-colors disabled:bg-blue-300"
        on:click={doLogin}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Login'}
      </button>
    </div>

    <div class="mt-6 text-center text-sm text-gray-500">
      <p>Deploying to: <span class="font-mono text-xs">pager-king-client.vercel.app</span></p>
    </div>
  </div>
</div>