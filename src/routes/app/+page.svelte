<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    getCurrentUser,
    getIncomingMessage,
    sendMessage,
    getUsers
  } from '$lib/api';
  import { goto } from '$app/navigation';

  // User state
  let user: { id: string; email: string } | null = null;
  let loading = true;

  // Messages state
  let incomingMessages: any[] = [];
  let outgoing = '';
  let sending = false;
  let error = '';

  // Users dropdown
  let users: { email: string }[] = [];
  let selectedReceiver = 'All';

  // Polling control
  let interval: NodeJS.Timer;
  let fetchingIncoming = false;

  // Fetch incoming messages
  const fetchIncoming = async () => {
    if (!user || fetchingIncoming) return;
    fetchingIncoming = true;

    try {
      const res = await getIncomingMessage();
      if (res.ok && Array.isArray(res.messages)) {
        incomingMessages = res.messages;
      } else {
        incomingMessages = [];
      }
    } catch (err) {
      console.error('Fetch incoming message error:', err);
      incomingMessages = [];
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
      const res = await sendMessage(selectedReceiver, outgoing);
      if (!res.ok) {
        error = res.error || 'Failed to send message';
      } else {
        outgoing = '';
        await fetchIncoming();
      }
    } catch (err) {
      console.error('Send message error:', err);
      error = 'Send error';
    } finally {
      sending = false;
    }
  };

  // Auth + polling + users
  onMount(async () => {
    loading = true;

    try {
      const res = await getCurrentUser();
      if (!res.ok) {
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        await goto('/login', { replaceState: true });
        return;
      }

      user = res.user;

      // Load users for dropdown
      const usersRes = await getUsers();
      if (usersRes.ok) {
        users = usersRes.users;
      }

      await fetchIncoming();
      interval = setInterval(fetchIncoming, 3000);

    } catch (err) {
      console.error('Error during mount:', err);
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

    <!-- Incoming Messages -->
    <div class="w-full max-w-md bg-white border rounded p-4 shadow mb-4 overflow-y-auto h-64">
      <h2 class="font-semibold mb-2">Messages</h2>
      {#if incomingMessages.length === 0}
        <p class="text-gray-500">No messages yet.</p>
      {:else}
        {#each incomingMessages as msg}
          <div class="mb-2 p-2 rounded border-b border-gray-200">
            <p class="text-sm text-gray-500">{msg.sender} → {msg.receiver}</p>
            <p>{msg.text}</p>
            <p class="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</p>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Outgoing Message -->
    <div class="w-full max-w-md bg-white border rounded p-4 shadow">
      <h2 class="font-semibold mb-2">Send Message</h2>
      <!-- Receiver Select -->
<label class="block mb-1 font-semibold">Send to</label>
<select
  class="w-full border rounded p-2 mb-2"
  bind:value={selectedReceiver}
>
  <option value="All">All</option>

  {#each users as u}
    <option value={u.email}>{u.email}</option>
  {/each}
</select>
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