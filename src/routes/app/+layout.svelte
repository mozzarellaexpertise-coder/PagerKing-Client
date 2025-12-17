<script lang="ts">
  export let data;
</script>

<header class="p-2 bg-gray-200 flex justify-between items-center">
  <h1>PagerKing</h1>
  <button on:click={() => supabase.auth.signOut().then(() => location.href = '/login')}>
    Logout
  </button>
</header>

<slot />