/** Allowed object key prefixes. Any key outside this list is rejected. */
export const DOWNLOAD_ALLOWED_PREFIXES = ['publications/', 'resources/'];

/** Signed URL lifetime (seconds). Override with DOWNLOAD_URL_TTL env. */
export function getSignedUrlTtlSeconds(): number {
  const raw = Number(process.env.DOWNLOAD_URL_TTL);
  if (Number.isFinite(raw) && raw >= 30 && raw <= 3600) return raw;
  return 180;
}
