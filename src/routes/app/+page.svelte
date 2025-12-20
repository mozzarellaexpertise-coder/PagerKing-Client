<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getCurrentUser, getIncomingMessage, sendMessage } from '$lib/api';
  import { goto } from '$app/navigation';

  // User state
  let user: { id: string; email: string } | null = null;
  let loading = true;

  // Messages state
  let incoming = '';
  let outgoing = '';
  let sending = false;
  let error = '';

  // Polling control
  let interval: NodeJS.Timer;
  let fetchingIncoming = false;

  // Fetch incoming message safely
  const fetchIncoming = async () => {
    if (!user || fetchingIncoming) return;
    fetchingIncoming = true;
    try {
      const res = await getIncomingMessage(user.email);
      if (res.ok) {
        incoming = res.message || '';
      } else {
        console.warn('Incoming fetch failed:', res.error);
        // optional: stop polling to prevent flooding
        // clearInterval(interval);
      }
    } catch (err) {
      console.error('Fetch incoming message error:', err);
      // optional: stop polling on persistent errors
      // clearInterval(interval);
    } finally {
      fetchingIncoming = false;
    }
  };

  // Send outgoing message
  const handleSend = async () => {
    if (!outgoing.trim() || sending || !user) return;
    sending = true;
    error = '';
    try {
      const res = await sendMessage(user.email, outgoing);
      if (!res.ok) {
        error = res.error || 'Failed to send message';
      } else {
        outgoing = '';
        await fetchIncoming(); // refresh incoming after send
      }
    } catch (err) {
      console.error('Send message error:', err);
      error = 'Send error';
    } finally {
      sending = false;
    }
  };

  // Auth + polling setup
  onMount(async () => {
    loading = true;
    try {
      const res = await getCurrentUser();

      if (!res.ok) {
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        await goto('/login', { replaceState: true });
        return; // stop execution
      }

      user = res.user;

      // Initial fetch
      await fetchIncoming();

      // Start polling every 3s
      interval = setInterval(fetchIncoming, 3000);

    } catch (err) {
      console.error('Error fetching current user:', err);
      await goto('/login', { replaceState: true });
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="min-h-screen flex flex-col items-center bg-gray-50 p-4">
  <h1 class="text-4xl font-bold mb-2">PagerKing 🦏</h1>

  {#if loading}
    <p>Loading your session...</p>
  {:else if user}
    <p class="mb-4 text-gray-700">Welcome {user.email}</p>

    <!-- Incoming Message -->
    <div class="w-full max-w-md bg-white border rounded p-4 shadow mb-4">
      <h2 class="font-semibold mb-2">Incoming Message</h2>
      <div class="border p-2 rounded min-h-[60px] bg-gray-100">
        {incoming || 'No messages yet.'}
      </div>
    </div>

    <!-- Outgoing Message -->
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