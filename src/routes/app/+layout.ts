import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { supabase } from '$lib/supabaseClient';
export const ssr = false;
export const load: LayoutLoad = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw redirect(303, '/login');
  }

  return {
    session
  };
};