<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { getMessages, sendMessage, subscribeMessages } from '$lib/api';

  type Message = {
    id: string;
    text: string;
    sender_email: string;
    receiver_email: string | 'All';
    created_at: string;
  };

  let messages: Message[] = [];
  let newMessage = '';
  let recipientId: string | null = null;
  let users: { id: string; email: string }[] = [];
  let currentUser: { id: string; email: string } | null = null;
  let loading = true;
  let sending = false;
  let messagesContainer: HTMLDivElement;

  // Fetch logged-in user
  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) currentUser = { id: user.id, email: user.email };
  };

  // Fetch all users for recipient dropdown
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('id,email');
    if (!error && data) users = data;
  };

  // Fetch messages
  const fetchAllMessages = async () => {
    if (!currentUser) return;
    messages = await getMessages();
  };

  // Send message
  const handleSend = async () => {
    if (!currentUser || !newMessage.trim()) return;
    sending = true;
    try {
      await sendMessage(newMessage, currentUser.id, recipientId);
      newMessage = '';
      recipientId = null;
      await fetchAllMessages();
    } catch (err: any) {
      console.error('Send failed:', err.message);
    } finally {
      sending = false;
    }
  };

  // Realtime subscription
  const setupRealtime = () => {
    subscribeMessages(supabase, async (msg) => {
      // Only refresh UI for relevant messages
      if (
        msg.sender_id === currentUser?.id ||
        msg.receiver_id === currentUser?.id ||
        msg.receiver_id === null
      ) {
        await fetchAllMessages();
      }
    });
  };

  // Auto-scroll
  $: if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  onMount(async () => {
    await fetchCurrentUser();
    await fetchUsers();
    await fetchAllMessages();
    setupRealtime();
    loading = false;
  });
</script>

<div class="max-w-xl mx-auto flex flex-col gap-4">
  <!-- Recipient Dropdown -->
  <div class="flex gap-2 items-center">
    <label class="font-semibold">Send to:</label>
    <select bind:value={recipientId} class="p-2 border rounded flex-1">
      <option value={null}>All</option>
      {#each users as u}
        {#if u.id !== currentUser?.id}
          <option value={u.id}>{u.email}</option>
        {/if}
      {/each}
    </select>
  </div>

  <!-- Messages List -->
  <div bind:this={messagesContainer} class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto border p-2 rounded bg-gray-50">
    {#if loading}
      <div class="text-center text-gray-400 italic">Loading messages…</div>
    {:else if messages.length === 0}
      <div class="text-center text-gray-500 italic">No messages yet</div>
    {:else}
      {#each messages as m}
        <div class={`p-2 rounded max-w-[75%] ${
          m.sender_email === currentUser?.email
            ? 'bg-blue-100 self-end'
            : m.receiver_email === 'All'
            ? 'bg-green-100 self-start'
            : 'bg-gray-100 self-start'
        }`}>
          <span class="font-bold">{m.sender_email}</span>
          {m.receiver_email !== 'All' ? ` → ${m.receiver_email}` : ''}: {m.text}
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
      on:keydown={(e) => e.key === 'Enter' && handleSend()}
      disabled={sending}
    />
    <button on:click={handleSend} class="bg-blue-600 text-white px-4 py-2 rounded" disabled={sending}>
      {sending ? 'Sending…' : 'Send'}
    </button>
  </div>
</div>