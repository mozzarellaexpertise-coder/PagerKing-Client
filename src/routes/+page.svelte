<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMsg = '';

  const handleLogin = async () => {
    errorMsg = '';

    // sign in and let Supabase set the auth cookie
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('LOGIN RESULT', data, error);

    if (error) {
      errorMsg = error.message;
      return;
    }

    // Optional: Confirm the session is set
    if (!data.session) {
      errorMsg = 'No session received';
      return;
    }

    // Now ensure profile exists
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email
    });

    // Redirect to the app
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
