<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { getCurrentUser, getMessages, sendMessage } from '$lib/api';

  // -----------------------------
  // Types
  // -----------------------------
  type Message = {
    id: string;
    text: string;
    sender_name: string;
    receiver_name: string | 'All';
    created_at: string;
  };

  type User = {
    id: string;
    email: string;
    name: string;
  };

  // -----------------------------
  // Reactive Stores
  // -----------------------------
  const messages = writable<Message[]>([]);
  const users = writable<User[]>([]);
  let currentUser: User | null = null;

  // -----------------------------
  // Local Component State
  // -----------------------------
  let newMessage = '';
  let recipientId: string | null = null;
  let loading = true;
  let messagesContainer: HTMLDivElement;

  // -----------------------------
  // Load current user
  // -----------------------------
  const loadCurrentUser = async () => {
    const res = await getCurrentUser();
    if (res.ok && res.user) {
      currentUser = res.user;
    }
  };

  // -----------------------------
  // Load messages
  // -----------------------------
  const loadMessages = async () => {
    if (!currentUser) return;
    const res = await getMessages();
    if (res.ok) {
      // Map to client-friendly format
      messages.set(
        res.data.map((m: any) => ({
          id: m.id,
          text: m.text,
          sender_name: m.sender?.name || m.sender?.email || 'Unknown',
          receiver_name: m.receiver?.name || 'All',
          created_at: m.created_at
        }))
      );
    }
  };

  // -----------------------------
  // Send a message
  // -----------------------------
  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;
    const res = await sendMessage(recipientId, newMessage);
    if (res.ok) {
      messages.update((m) => [...m, res.data]);
      newMessage = '';
      recipientId = null;
      scrollToBottom();
    } else {
      console.error('Send message error:', res.error);
    }
  };

  // -----------------------------
  // Auto-scroll
  // -----------------------------
  const scrollToBottom = () => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  $: scrollToBottom();

  // -----------------------------
  // Real-time subscription
  // -----------------------------
  const subscribeRealtime = () => {
    if (!currentUser) return;

    const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/messages/stream`);
    evtSource.onmessage = async (event) => {
      const payload = JSON.parse(event.data);
      const msg = payload.new;

      // Only show messages relevant to current user
      if (
        msg.sender_id === currentUser?.id ||
        msg.receiver_id === currentUser?.id ||
        msg.receiver_id === null
      ) {
        await loadMessages();
      }
    };
    return () => evtSource.close();
  };

  // -----------------------------
  // Mount lifecycle
  // -----------------------------
  onMount(async () => {
    await loadCurrentUser();
    await loadMessages();
    subscribeRealtime();
    loading = false;
  });
</script>

<div class="max-w-xl mx-auto flex flex-col gap-4 p-4">

  {#if !currentUser}
    <div class="text-center text-red-600 font-bold">Please log in to see messages</div>
  {:else}

    <!-- Recipient Dropdown -->
    <div class="flex gap-2 items-center">
      <label for="recipient" class="font-semibold">Send to:</label>
      <select id="recipient" bind:value={recipientId} class="p-2 border rounded flex-1">
        <option value={null}>All</option>
        {#each $users as u}
          <option value={u.id}>{u.name}</option>
        {/each}
      </select>
    </div>

    <!-- Messages Container -->
    <div bind:this={messagesContainer} class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto border p-2 rounded bg-gray-50">
      {#if loading}
        <div class="text-center text-gray-400 italic">Loading messages…</div>
      {:else if $messages.length === 0}
        <div class="text-center text-gray-500 italic">No messages yet</div>
      {:else}
        {#each $messages as m}
          <div
            class={`p-2 rounded max-w-[75%] ${
              m.sender_name === currentUser.name
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
    <div class="flex gap-2 mt-2">
      <input
        type="text"
        placeholder="Type your message..."
        bind:value={newMessage}
        class="flex-1 p-2 border rounded"
        on:keydown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button on:click={handleSend} class="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
    </div>

  {/if}

</div>
<style>
  /* Add any additional styles here */
</style>  