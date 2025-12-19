const API_BASE = 'https://pagerking.vercel.app/api';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/currentUser`, {
    credentials: 'include'
  });

  return res.json();
}

export async function getMessages() {
  const res = await fetch(`${API_BASE}/messages`, {
    credentials: 'include'
  });

  return res.json();
}