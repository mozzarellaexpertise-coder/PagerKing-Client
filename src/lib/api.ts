const BASE_URL = import.meta.env.VITE_API_URL;

export async function getMessages() {
  const res = await fetch(`${BASE_URL}/api/messages`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch messages');

  // Map sender and receiver emails for frontend
  return data.data.map((msg: any) => ({
    id: msg.id,
    text: msg.text,
    sender_email: msg.sender?.email ?? 'Unknown',
    receiver_email: msg.receiver?.email ?? 'All',
    created_at: msg.created_at
  }));
}

export async function sendMessage(
  text: string,
  sender_id: string,
  receiver_id?: string | null
) {
  if (!text.trim()) throw new Error('Message cannot be empty');
  if (!sender_id) throw new Error('Sender ID is required');

  const res = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      sender_id,
      receiver_id: receiver_id ?? null
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send message');
  return data.data;
}

// Realtime subscription for UI updates (no inserts!)
export function subscribeMessages(supabaseClient: any, callback: (msg: any) => void) {
  return supabaseClient
    .from('messages')
    .on('INSERT', payload => {
      callback(payload.new);
    })
    .subscribe();
}