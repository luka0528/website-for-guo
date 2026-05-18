import { supabase } from '../lib/supabaseClient';

type Locale = 'zh' | 'en';

function getLocaleFromPath() {
  const pathname = window.location.pathname;
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh';
}

function t(locale: Locale, zh: string, en: string) {
  return locale === 'en' ? en : zh;
}

async function init() {
  const locale = getLocaleFromPath();
  const root = document.getElementById('auth-status');
  if (!root) return;

  const redirect = encodeURIComponent(window.location.pathname + window.location.search);

  async function render() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      root.innerHTML = `
        <a class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
           href="${locale === 'en' ? '/en/login' : '/login'}?redirect=${redirect}">
          ${t(locale, '登录', 'Log in')}
        </a>
      `;
      return;
    }

    root.innerHTML = `
      <button class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              id="logout-btn" type="button">
        ${t(locale, '退出', 'Log out')}
      </button>
    `;
    const btn = root.querySelector<HTMLButtonElement>('#logout-btn');
    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        await supabase.auth.signOut();
      } finally {
        btn.disabled = false;
      }
      await render();
    });
  }

  await render();
  supabase.auth.onAuthStateChange(async () => {
    await render();
  });
}

init();

