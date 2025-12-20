import { supabase } from '$lib/supabaseClient';

const BASE_URL = 'https://pagerking.vercel.app/api';

/* =========================
   AUTH HEADER HELPER
========================= */
async function getAuthHeaders() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return { 'Content-Type': 'application/json' };
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session.access_token}`
  };
}

/* =========================
   CURRENT USER
========================= */
export async function getCurrentUser() {
  // 🔥 Get token from localStorage
  const token = localStorage.getItem('sb-access-token');
  if (!token) return { ok: false };

  const res = await fetch('https://pagerking.vercel.app/api/currentUser', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return { ok: false };

  const { user } = await res.json();
  return { ok: true, user };
}
/* =========================
   LOGIN (CLIENT → SERVER)
========================= */
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error('Login failed');
  }

  return res.json();
}