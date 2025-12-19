<script lang="ts">
  import { onMount } from 'svelte';
  import { messages } from '$lib/stores/messages';
  import { getMessages, sendMessage, getCurrentUser } from '$lib/api';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMsg = '';
  let newMessage = '';
  let receiver: string | null = null; // default to all

  let currentUser: any = null;

  // LOGIN
  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { errorMsg = error.message; return; }

    // fetch current user after login
    const userData = await getCurrentUser();
    if (userData.ok) currentUser = userData.user;

    await loadMessages();
  }

  // FETCH MESSAGES
  async function loadMessages() {
    const res = await getMessages();
    if (res.ok) messages.set(res.data);
  }

  // SEND MESSAGE
  async function handleSend() {
    if (!newMessage.trim()) return;
    const res = await sendMessage(receiver, newMessage);
    if (res.ok) {
      messages.update((m) => [...m, res.data]);
      newMessage = '';
    }
  }

  onMount(async () => {
    const userData = await getCurrentUser();
    if (userData.ok) {
      currentUser = userData.user;
      await loadMessages();
    }
  });
</script>

{#if !currentUser}
  <h2>Login</h2>
  <input type="email" bind:value={email} placeholder="Email" />
  <input type="password" bind:value={password} placeholder="Password" />
  <button on:click={handleLogin}>Login</button>
  <p>{errorMsg}</p>
{:else}
  <h2>Welcome, {currentUser.name}</h2>

  <div>
    <input type="text" bind:value={newMessage} placeholder="Type a message" />
    <input type="text" bind:value={receiver} placeholder="Receiver email (leave empty for all)" />
    <button on:click={handleSend}>Send</button>
  </div>

  <ul>
    {#each $messages as msg}
      <li>
        <strong>{msg.sender_id}</strong> to <em>{msg.receiver_id || 'All'}</em>:
        {msg.text} <small>({msg.created_at})</small>
      </li>
    {/each}
  </ul>
{/if}
