<script lang="ts">
  let email = '';
  let password = '';
</script>

<h1>Login</h1>

<input placeholder="email" bind:value={email} />
<input type="password" placeholder="password" bind:value={password} />

<button>Login</button>