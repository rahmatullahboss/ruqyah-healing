export const LOCALES = ['bn', 'en'];

export const LOCALE_LABELS = {
  bn: 'বাংলা',
  en: 'English',
};

export const LOCALE_META = {
  bn: {
    code: 'bn',
    lang: 'bn',
    ogLocale: 'bn_BD',
    prefix: '',
    label: 'বাংলা',
  },
  en: {
    code: 'en',
    lang: 'en',
    ogLocale: 'en_US',
    prefix: '/en',
    label: 'English',
  },
};

export const SITE_DEFAULT_LOCALE = 'bn';

export function normalizeLocale(locale) {
  return locale === 'en' ? 'en' : 'bn';
}

export function getLocaleFromPathname(pathname = '/') {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'bn';
}

export function stripLocalePrefix(pathname = '/') {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

export function addLocalePrefix(pathname = '/', locale = 'bn') {
  const normalized = normalizeLocale(locale);
  const barePath = pathname === '/' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (normalized === 'bn') return barePath;
  if (barePath === '/') return '/en/';
  return barePath.startsWith('/en/') || barePath === '/en' ? barePath : `/en${barePath}`;
}

export function localeAlternates(pathname = '/') {
  const basePath = stripLocalePrefix(pathname);
  return {
    bn: addLocalePrefix(basePath, 'bn'),
    en: addLocalePrefix(basePath, 'en'),
    xDefault: addLocalePrefix(basePath, SITE_DEFAULT_LOCALE),
  };
}

export function getPageLocale(pathname = '/') {
  return getLocaleFromPathname(pathname);
}

export function getLocaleMeta(locale) {
  return LOCALE_META[normalizeLocale(locale)];
}

