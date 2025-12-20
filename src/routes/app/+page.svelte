<script lang="ts">
  import { onMount } from 'svelte';
  import { getCurrentUser, getIncomingMessage, sendMessage } from '$lib/api';

  import { goto } from '$app/navigation';

  let user: { id: string; email: string } | null = null;
  let loading = true;

  // Messaging state
  let incoming = '';
  let outgoing = '';
  let sending = false;
  let error = '';

  const fetchUser = async () => {
    const res = await getCurrentUser();
    if (!res.ok) {
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      await goto('/login', { replaceState: true });
      return;
    }
    user = res.user;
  };

  const fetchIncoming = async () => {
    if (!user) return;
    const res = await getIncomingMessage(user.email);
    if (res.ok) incoming = res.message || '';
  };

  const handleSend = async () => {
    if (!outgoing.trim()) return;
    sending = true;
    error = '';
    try {
      const res = await sendMessage(user!.email, outgoing);
      if (!res.ok) {
        error = res.error || 'Failed to send message';
      } else {
        // Optional: clear input after send
        outgoing = '';
      }
    } catch (err) {
      console.error(err);
      error = 'Send error';
    } finally {
      sending = false;
    }
  };

  onMount(async () => {
    await fetchUser();
    if (user) await fetchIncoming();
    loading = false;
  });
</script>

<div class="min-h-screen flex flex-col items-center bg-gray-50 p-4">
  <h1 class="text-4xl font-bold mb-2">PagerKing 🦏</h1>

  {#if loading}
    <p>Loading your session...</p>
  {:else if user}
    <p class="mb-4 text-gray-700">Welcome {user.email}</p>

    <div class="w-full max-w-md bg-white border rounded p-4 shadow mb-4">
      <h2 class="font-semibold mb-2">Incoming Message</h2>
      <div class="border p-2 rounded min-h-[60px] bg-gray-100">
        {incoming || 'No messages yet.'}
      </div>
    </div>

    <div class="w-full max-w-md bg-white border rounded p-4 shadow">
      <h2 class="font-semibold mb-2">Send Message</h2>
      <textarea
        class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
        rows="3"
        bind:value={outgoing}
        placeholder="Type your message..."
      ></textarea>
      {#if error}
        <p class="text-red-600 mb-2 text-sm">{error}</p>
      {/if}
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded disabled:bg-blue-300"
        on:click={handleSend}
        disabled={sending}
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
    </div>
  {/if}
</div>