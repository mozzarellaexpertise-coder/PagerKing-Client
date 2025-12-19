<script lang="ts">
  import { onMount } from 'svelte';
  import { getCurrentUser } from '$lib/api';
  import { goto } from '$app/navigation';

  let user: any = null;

  onMount(async () => {
    const res = await getCurrentUser();

    if (!res.ok) {
      goto('/login');
      return;
    }

    user = res.user;
  });
</script>

<h1>PagerKing</h1>

{#if user}
  <p>Welcome {user.email}</p>
{/if}