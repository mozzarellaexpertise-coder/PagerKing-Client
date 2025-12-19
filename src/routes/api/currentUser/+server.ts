import { json } from '@sveltejs/kit';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://pager-king-client.vercel.app',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true'
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function GET({ locals }) {
  if (!locals.user) {
    return json({ ok: false, user: null }, { status: 401, headers: CORS_HEADERS });
  }

  return json(
    { ok: true, user: locals.user },
    { headers: CORS_HEADERS }
  );
}