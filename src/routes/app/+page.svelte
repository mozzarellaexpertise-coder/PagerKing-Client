<script lang="ts">
  import { onMount } from 'svelte';

  type Message = {
    id: string;
    sender_name: string;
    receiver_name: string | 'All';
    text: string;
    created_at: string;
  };

  let messages: Message[] = [];
  let newMessage = '';
  let recipientId: string | null = null;
  let users: { id: string; name: string }[] = [];
  let currentUser: { id: string; name: string } | null = null;

  let loading = true;
  let messagesContainer: HTMLDivElement;

  const SERVER_BASE = 'https://pagerking.vercel.app/api';

  // Fetch current user
  const fetchCurrentUser = async () => {
    const res = await fetch(`${SERVER_BASE}/currentUser`, {
      credentials: 'include'
    });
    const data = await res.json();
    if (!data.ok || !data.user) return;

    currentUser = data.user;
  };

  // Fetch all users for recipient dropdown
  const fetchUsers = async () => {
    const res = await fetch(`${SERVER_BASE}/users`, { credentials: 'include' });
    const data = await res.json();
    if (data.ok && data.users) {
      users = data.users.filter(u => u.id !== currentUser?.id);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    const res = await fetch(`${SERVER_BASE}/messages`, { credentials: 'include' });
    const data = await res.json();
    if (data.ok && data.data) {
      messages = data.data.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        sender_name: msg.sender?.name || 'Unknown',
        receiver_name: msg.receiver?.name || 'All',
        created_at: msg.created_at
      }));
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const res = await fetch(`${SERVER_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        text: newMessage,
        receiver_id: recipientId
      })
    });

    const data = await res.json();
    if (data.ok) {
      newMessage = '';
      recipientId = null;
      fetchMessages();
    } else {
      console.error('Send message error:', data.error);
    }
  };

  // Auto-scroll
  $: if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  onMount(async () => {
    await fetchCurrentUser();
    await fetchUsers();
    await fetchMessages();

    // Optional: Poll every 5 seconds for new messages
    setInterval(fetchMessages, 5000);

    loading = false;
  });
</script>

<div class="max-w-xl mx-auto flex flex-col gap-4">
  <!-- Recipient Dropdown -->
  <div class="flex gap-2 items-center">
    <label for="recipient" class="font-semibold">Send to:</label>
    <select id="recipient" bind:value={recipientId} class="p-2 border rounded flex-1">
      <option value={null}>All</option>
      {#each users as u}
        <option value={u.id}>{u.name}</option>
      {/each}
    </select>
  </div>

  <!-- Messages List -->
  <div bind:this={messagesContainer} class="messages-container flex flex-col gap-2 max-h-[60vh] overflow-y-auto border p-2 rounded bg-gray-50">
    {#if loading}
      <div class="text-center text-gray-400 italic">Loading messages…</div>
    {:else if messages.length === 0}
      <div class="text-center text-gray-500 italic">No messages yet</div>
    {:else}
      {#each messages as m}
        <div
          class={`p-2 rounded max-w-[75%] ${
            m.sender_name === currentUser?.name
              ? 'bg-blue-100 self-end'
              : m.receiver_name === 'All'
              ? 'bg-green-100 self-start'
              : 'bg-gray-100 self-start'
          }`}
        >
          <span class="font-bold">{m.sender_name}</span>
          {m.receiver_name !== 'All' ? ` → ${m.receiver_name}` : ''}: {m.text}
          <div class="text-xs text-gray-500">{new Date(m.created_at).toLocaleTimeString()}</div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Input -->
  <div class="flex gap-2">
    <input
      type="text"
      placeholder="Type your message..."
      bind:value={newMessage}
      class="flex-1 p-2 border rounded"
      on:keydown={(e) => e.key === 'Enter' && sendMessage()}
    />
    <button on:click={sendMessage} class="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
  </div>
</div>

<style>
  .messages-container {
    scroll-behavior: smooth;
  }
</style>
