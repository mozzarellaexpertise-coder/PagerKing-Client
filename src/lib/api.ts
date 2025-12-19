const BASE_URL = import.meta.env.VITE_API_URL;

export async function getMessages() {
  const res = await fetch(`${BASE_URL}/messages`, { credentials: 'include' });
  return res.json();
}

export async function sendMessage(receiver_id: string | null, text: string) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver_id, text })
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${BASE_URL}/currentUser`, { credentials: 'include' });
  return res.json();
}