import { getConfig } from '@edx/frontend-platform';

/** 'ar-EG' -> 'ar' */
export const primaryLang = (locale) => String(locale || 'en').toLowerCase().split(/[-_]/)[0];

/** Pick the text of a `{ar, en}` pair for the current language, falling back to whichever exists. */
export const localize = (value, lang) => {
  if (value === null || value === undefined) { return ''; }
  if (typeof value === 'string') { return value; }
  return value[lang] || value.en || value.ar || '';
};

const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Resolve a URL coming from the API against the LMS base and refuse anything that is not
 * http(s)/mailto/tel (e.g. `javascript:`). Relative paths are relative to the LMS, not to the MFE origin.
 *
 * @returns {string|null}
 */
export const resolveUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) { return null; }
  try {
    const parsed = new URL(url.trim(), getConfig().LMS_BASE_URL || window.location.origin);
    return ALLOWED_SCHEMES.includes(parsed.protocol) ? parsed.href : null;
  } catch (e) {
    return null;
  }
};

const trimSlash = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Is `url` the page the user is on (the site root: exact match; others: the page or anything below it)? */
export const isCurrentPage = (url) => {
  const resolved = resolveUrl(url);
  if (!resolved || !/^https?:/.test(resolved)) { return false; }
  const target = new URL(resolved);
  if (target.origin !== window.location.origin) { return false; }
  const here = trimSlash(window.location.pathname);
  const there = trimSlash(target.pathname);
  if (there === '/') { return here === there; }
  return here === there || here.startsWith(`${there}/`);
};

export const firstNameOf = (fullName) => (fullName ? String(fullName).trim().split(/\s+/)[0] : '');

export const initialOf = (name) => {
  const first = Array.from(String(name || '').trim())[0];
  return first ? first.toUpperCase() : '';
};

/** `ali@example.com` -> `a***@example.com` */
export const maskEmail = (email) => {
  if (typeof email !== 'string' || !email.includes('@')) { return ''; }
  const [local, ...rest] = email.split('@');
  return `${Array.from(local)[0] || ''}***@${rest.join('@')}`;
};

export const clampPercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) { return 0; }
  return Math.min(100, Math.max(0, Math.round(n)));
};

const SOCIAL_URLS = {
  x: (h) => `https://x.com/${h}`,
  instagram: (h) => `https://www.instagram.com/${h}`,
  snapchat: (h) => `https://www.snapchat.com/add/${h}`,
  youtube: (h) => `https://www.youtube.com/@${h}`,
  linkedin: (h) => `https://www.linkedin.com/company/${h}`,
  facebook: (h) => `https://www.facebook.com/${h}`,
  tiktok: (h) => `https://www.tiktok.com/@${h}`,
  telegram: (h) => `https://t.me/${h}`,
  whatsapp: (h) => `https://wa.me/${h}`,
};

export const socialKey = (provider) => {
  const key = String(provider || '').toLowerCase().trim();
  return key === 'twitter' ? 'x' : key;
};

/** Social `value` is either a full URL or a handle; return a safe href or null. */
export const socialHref = (provider, value) => {
  if (typeof value !== 'string' || !value.trim()) { return null; }
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) { return resolveUrl(v); }
  const build = SOCIAL_URLS[socialKey(provider)];
  return build ? build(v.replace(/^@/, '')) : null;
};
