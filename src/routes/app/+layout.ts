import type { LayoutLoad } from './$types';
import { supabase } from '$lib/supabaseClient';
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw redirect(303, '/login');
  }

  return { session };
};