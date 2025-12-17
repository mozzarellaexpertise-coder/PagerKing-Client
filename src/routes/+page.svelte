<script lang="ts">
  import { onMount } from 'svelte';
  import { getMessages, sendMessage } from '$lib/api';

  let message = '';
  let receiver = '';
  let messages: any[] = [];

  const SENDER = '710aec01-3655-409b-a397-00c5dd12455d';

  const names: Record<string, string> = {
    '710aec01-3655-409b-a397-00c5dd12455d': 'Gerald',
    '380e3697-9782-41c3-87a4-beb53418169b': 'Lisa'
  };

  function name(id: string | null) {
    if (!id) return 'All';
    return names[id] || id;
  }

  async function loadPager() {
    const res = await getMessages();
    messages = res.data || [];
  }

  onMount(loadPager);

  async function handleSend() {
    if (!message.trim()) return;

    await sendMessage(message, SENDER, receiver || null);
    message = '';
    receiver = '';
    await loadPager(); // refresh pager
  }
</script>

<h1>📟 PagerKing Inbox</h1>

<div class="pager">
  <input bind:value={receiver} placeholder="Receiver ID (optional)" />
  <input bind:value={message} placeholder="Pager message…" />
  <button on:click={handleSend}>Send</button>

  <ul>
    {#each messages as msg (msg.id)}
      <li>
        <strong>{name(msg.sender_id)}</strong>
        →
        <strong>{name(msg.receiver_id)}</strong>
        <br />
        {msg.text}
        <em>({new Date(msg.created_at).toLocaleTimeString()})</em>
      </li>
    {/each}
  </ul>
</div>

<style>
  .pager {
    max-width: 600px;
    margin: auto;
  }
  li {
    border-bottom: 1px solid #ccc;
    padding: 8px 0;
  }
</style>