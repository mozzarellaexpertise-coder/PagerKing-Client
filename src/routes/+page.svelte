<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/login');
  });
</script>

<h1>PagerKing</h1>
<p>Redirecting…</p>