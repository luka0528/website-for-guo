import type { CookieOptions } from 'express';

export const AUTH_ACCESS_COOKIE = 'access_token';
export const AUTH_REFRESH_COOKIE = 'refresh_token';

/** JWT `expiresIn` / cookie max-age: seconds */
export function getAccessExpiresSeconds(): number {
  const raw = process.env.JWT_ACCESS_EXPIRES || '15m';
  const m = /^(\d+)m$/i.exec(raw);
  if (m) return Number(m[1]) * 60;
  const h = /^(\d+)h$/i.exec(raw);
  if (h) return Number(h[1]) * 3600;
  const d = /^(\d+)d$/i.exec(raw);
  if (d) return Number(d[1]) * 86400;
  return 15 * 60;
}

export function getCookieOptions(maxAgeMs: number): CookieOptions {
  const secure =
    process.env.COOKIE_SECURE === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false');

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}
