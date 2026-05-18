import { supabase } from '../lib/supabaseClient';

function localeFromPath() {
  const p = window.location.pathname;
  return p === '/en' || p.startsWith('/en/') ? 'en' : 'zh';
}

function loginUrl(redirect: string) {
  const locale = localeFromPath();
  const base = locale === 'en' ? '/en/login' : '/login';
  return `${base}?redirect=${encodeURIComponent(redirect)}`;
}

async function main() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.download-link'));
  if (links.length === 0) return;

  const redirect = window.location.pathname + window.location.search;

  for (const a of links) {
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      a.setAttribute('aria-busy', 'true');

      try {
        const visibility = a.dataset.visibility || 'auth';
        const href = a.getAttribute('href') || '';

        if (visibility === 'public') {
          window.location.href = href;
          return;
        }

        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session) {
          window.location.href = loginUrl(redirect);
          return;
        }

        const res = await fetch(href, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: 'application/json'
          }
        });

        if (res.status === 401) {
          window.location.href = loginUrl(redirect);
          return;
        }
        if (!res.ok) {
          alert(`Download failed (${res.status}).`);
          return;
        }

        const json = (await res.json().catch(() => null)) as null | { url?: string };
        if (json?.url) {
          window.location.href = json.url;
          return;
        }
        alert('Download failed: no signed URL returned.');
      } finally {
        a.removeAttribute('aria-busy');
      }
    });
  }
}

main();

