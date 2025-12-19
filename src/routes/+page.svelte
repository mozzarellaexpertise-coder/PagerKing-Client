<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  // WRONG: This runs on the server and causes the 500 crash
  // goto('/login'); 

  // RIGHT: This only runs once the page is in the browser
  onMount(() => {
    goto('/login');
  });

  // OR USE AN IF-CHECK:
  // if (browser) {
  //   goto('/login');
  // }
</script>