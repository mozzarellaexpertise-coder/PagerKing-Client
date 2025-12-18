<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';

  type Message = {
    id: string;
    sender_email: string;
    receiver_email: string | 'All';
    text: string;
    created_at: string;
  };

  let messages: Message[] = [];
  let newMessage = '';
  let recipientId: string | null = null;
  let users: { id: string; email: string }[] = [];
  let currentUser: { id: string; email: string; id: string } | null = null;

  let loading = true;
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

  // Fetch messages relevant to current user
  const fetchMessages = async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        text,
        created_at,
        sender_id,
        receiver_id,
        sender:sender_id ( email ),
        receiver:receiver_id ( email )
      `)
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id},receiver_id.is.null`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      messages = data.map(msg => ({
        id: msg.id,
        text: msg.text,
        sender_email: msg.sender.email,
        receiver_email: msg.receiver?.email || 'All',
        created_at: msg.created_at
      }));
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!currentUser) return;

    const { error } = await supabase.from('messages').insert([
      {
        text: newMessage,
        sender_id: currentUser.id,
        receiver_id: recipientId
      }
    ]);

    if (!error) {
      newMessage = '';
      recipientId = null;
      fetchMessages();
    }
  };

  // Realtime subscription
  const subscribeRealtime = () => {
    const subscription = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          const msg = payload.new;
          if (
            msg.sender_id === currentUser?.id ||
            msg.receiver_id === currentUser?.id ||
            msg.receiver_id === null
          ) {
            fetchMessages();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  };

  // Auto-scroll whenever messages change
  $: if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  onMount(async () => {
    await fetchCurrentUser();
    await fetchUsers();
    await fetchMessages();
    subscribeRealtime();
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
        <div
          class={`p-2 rounded max-w-[75%] ${
            m.sender_email === currentUser?.email
              ? 'bg-blue-100 self-end'
              : m.receiver_email === 'All'
              ? 'bg-green-100 self-start'
              : 'bg-gray-100 self-start'
          }`}
        >
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
      on:keydown={(e) => e.key === 'Enter' && sendMessage()}
    />
    <button on:click={sendMessage} class="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
  </div>
</div>