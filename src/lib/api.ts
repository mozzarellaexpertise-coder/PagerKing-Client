import { supabase } from '$lib/supabaseClient';

const BASE_URL = 'https://pagerking.vercel.app/api';

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

export async function getCurrentUser() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/currentUser`, { headers });

  if (!res.ok) {
    throw new Error(`Unauthorized (${res.status})`);
  }

  return res.json();
}