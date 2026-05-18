import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export const prerender = false;

const BUCKET = 'downloads';
const EXPIRES_IN = 60; // seconds

function getBearer(req: Request) {
  const h = req.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1];
}

export const GET: APIRoute = async ({ params, request, redirect }) => {
  const key = params.key;
  const rawKey = Array.isArray(key) ? key.join('/') : key;
  const objectKey = rawKey ? decodeURIComponent(rawKey) : rawKey;
  if (!objectKey) {
    return new Response('Missing key', { status: 400 });
  }

  const token = getBearer(request);
  const accept = request.headers.get('accept') || '';
  const referer = request.headers.get('referer');
  const fromPath = (() => {
    if (!referer) return null;
    try {
      const u = new URL(referer);
      return `${u.pathname}${u.search}`;
    } catch {
      return null;
    }
  })();
  const locale = fromPath?.startsWith('/en') ? 'en' : 'zh';
  const loginPath = locale === 'en' ? '/en/login' : '/login';
  const redirectTo = encodeURIComponent(fromPath || (locale === 'en' ? '/en' : '/'));

  if (!token) {
    if (!accept.includes('application/json')) {
      return redirect(`${loginPath}?redirect=${redirectTo}`, 302);
    }
    return new Response('Unauthorized', { status: 401 });
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData.user) {
    if (!accept.includes('application/json')) {
      return redirect(`${loginPath}?redirect=${redirectTo}`, 302);
    }
    return new Response('Unauthorized', { status: 401 });
  }

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(objectKey, EXPIRES_IN);
  if (error || !data?.signedUrl) {
    return new Response('Not found', { status: 404 });
  }

  if (accept.includes('application/json')) {
    return new Response(JSON.stringify({ url: data.signedUrl }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  return redirect(data.signedUrl, 302);
};

