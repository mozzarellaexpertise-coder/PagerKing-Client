const BASE_URL = import.meta.env.VITE_API_URL;

export async function getMessages() {
  const res = await fetch(`${BASE_URL}/api/messages`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch messages');
  return data;
}

export async function sendMessage(text: string, sender_id?: string, receiver_id?: string) {
  const res = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sender_id, receiver_id })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send message');
  return data;
}

// --- Realtime listener for new messages ---
export function subscribeMessages(supabaseClient: any, callback: (msg: any) => void) {
  return supabaseClient
    .from('messages')
    .on('INSERT', payload => {
      callback(payload.new);
    })
    .subscribe();
}