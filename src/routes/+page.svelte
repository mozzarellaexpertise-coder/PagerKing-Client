<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMsg = '';

  const handleLogin = async () => {
    errorMsg = '';

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('LOGIN RESULT', data, error);

    if (error) {
      errorMsg = error.message;
      return;
    }

    // ensure profile exists
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email
    });

    goto('/app');
  };
</script>

<h1>Login</h1>

<input placeholder="Email" bind:value={email} />
<input placeholder="Password" type="password" bind:value={password} />

<button on:click={handleLogin}>Login</button>

{#if errorMsg}
  <p style="color:red">{errorMsg}</p>
{/if}