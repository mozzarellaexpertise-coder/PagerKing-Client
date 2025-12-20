import { supabase } from '$lib/supabaseClient';
const BASE_URL = 'https://pagerking.vercel.app/api';

// -------------------- TOKEN HELPER --------------------
async function getToken() {
  const sessionRes = await supabase.auth.getSession();
  const token = sessionRes.data?.session?.access_token;
  if (token) return token;
  return localStorage.getItem('sb-access-token');
}

async function getAuthHeaders() {
  const token = await getToken();
  if (!token) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

// -------------------- LOGIN --------------------
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error('Login failed');

  const data = await res.json();
  const token = data?.session?.access_token;
  const refreshToken = data?.session?.refresh_token;

  if (token) {
    localStorage.setItem('sb-access-token', token);
    localStorage.setItem('sb-refresh-token', refreshToken || '');
  }

  return data;
}

// -------------------- CURRENT USER --------------------
export async function getCurrentUser() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/currentUser`, { headers });

  if (!res.ok) return { ok: false };
  const { user } = await res.json();
  return { ok: true, user };
}

//-------------------- USERS LIST --------------------
export async function getUsers() {
  const token = localStorage.getItem('sb-access-token');
  if (!token) return { ok: false, users: [] };

  const res = await fetch(
    'https://pagerking.vercel.app/api/users',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) return { ok: false, users: [] };

  const json = await res.json();
  return {
    ok: json.ok,
    users: Array.isArray(json.users) ? json.users : []
  };
}

// -------------------- INCOMING MESSAGE --------------------
export async function getIncomingMessage() {
  const token = localStorage.getItem('sb-access-token');
  if (!token) return { ok: false, messages: [] };

  const res = await fetch(
    `https://pagerking.vercel.app/api/getIncomingMessage`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) return { ok: false, messages: [] };

  const json = await res.json();
  return {
    ok: json.ok,
    messages: json.messages ?? []   // 🔒 SAFETY NET
  };
}

// -------------------- SEND MESSAGE --------------------
export async function sendMessage(receiver: string, text: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/sendMessage`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ receiver, text })
  });
  if (!res.ok) return { ok: false };
  return res.json();
}