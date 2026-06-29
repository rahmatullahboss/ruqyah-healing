import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeLocale,
  getLocaleFromPathname,
  stripLocalePrefix,
  addLocalePrefix,
  localeAlternates,
  getPageLocale,
  getLocaleMeta,
  LOCALES,
  LOCALE_LABELS,
  LOCALE_META,
  SITE_DEFAULT_LOCALE,
} from '../src/lib/i18n.js';

// --- normalizeLocale ---

test('normalizeLocale returns "en" for "en"', () => {
  assert.equal(normalizeLocale('en'), 'en');
});

test('normalizeLocale returns "bn" for "bn"', () => {
  assert.equal(normalizeLocale('bn'), 'bn');
});

test('normalizeLocale returns "bn" for any unknown locale', () => {
  assert.equal(normalizeLocale('fr'), 'bn');
  assert.equal(normalizeLocale(''), 'bn');
  assert.equal(normalizeLocale('EN'), 'bn');
  assert.equal(normalizeLocale(undefined), 'bn');
});

// --- getLocaleFromPathname ---

test('getLocaleFromPathname returns "en" for /en paths', () => {
  assert.equal(getLocaleFromPathname('/en'), 'en');
  assert.equal(getLocaleFromPathname('/en/'), 'en');
  assert.equal(getLocaleFromPathname('/en/about'), 'en');
  assert.equal(getLocaleFromPathname('/en/courses/123'), 'en');
});

test('getLocaleFromPathname returns "bn" for non-English paths', () => {
  assert.equal(getLocaleFromPathname('/'), 'bn');
  assert.equal(getLocaleFromPathname('/about'), 'bn');
  assert.equal(getLocaleFromPathname('/courses'), 'bn');
  assert.equal(getLocaleFromPathname('/endpoint'), 'bn');
});

test('getLocaleFromPathname returns "bn" for paths that contain "en" but not as prefix', () => {
  assert.equal(getLocaleFromPathname('/english'), 'bn');
  assert.equal(getLocaleFromPathname('/api/en/data'), 'bn');
});

test('getLocaleFromPathname defaults to "/" when undefined', () => {
  assert.equal(getLocaleFromPathname(), 'bn');
  assert.equal(getLocaleFromPathname(undefined), 'bn');
});

// --- stripLocalePrefix ---

test('stripLocalePrefix strips /en prefix', () => {
  assert.equal(stripLocalePrefix('/en'), '/');
  assert.equal(stripLocalePrefix('/en/'), '/');
  assert.equal(stripLocalePrefix('/en/about'), '/about');
  assert.equal(stripLocalePrefix('/en/courses/123'), '/courses/123');
});

test('stripLocalePrefix returns path unchanged for bn (no prefix)', () => {
  assert.equal(stripLocalePrefix('/'), '/');
  assert.equal(stripLocalePrefix('/about'), '/about');
  assert.equal(stripLocalePrefix('/courses/123'), '/courses/123');
});

test('stripLocalePrefix defaults to "/" when undefined', () => {
  assert.equal(stripLocalePrefix(), '/');
  assert.equal(stripLocalePrefix(undefined), '/');
});

// --- addLocalePrefix ---

test('addLocalePrefix returns bare path for bn locale', () => {
  assert.equal(addLocalePrefix('/', 'bn'), '/');
  assert.equal(addLocalePrefix('/about', 'bn'), '/about');
  assert.equal(addLocalePrefix('/courses/123', 'bn'), '/courses/123');
});

test('addLocalePrefix adds /en prefix for en locale', () => {
  assert.equal(addLocalePrefix('/', 'en'), '/en/');
  assert.equal(addLocalePrefix('/about', 'en'), '/en/about');
  assert.equal(addLocalePrefix('/courses/123', 'en'), '/en/courses/123');
});

test('addLocalePrefix does not double-prefix /en paths', () => {
  assert.equal(addLocalePrefix('/en/about', 'en'), '/en/about');
  assert.equal(addLocalePrefix('/en', 'en'), '/en');
});

test('addLocalePrefix handles non-slash-prefixed paths', () => {
  assert.equal(addLocalePrefix('about', 'en'), '/en/about');
  assert.equal(addLocalePrefix('about', 'bn'), '/about');
});

test('addLocalePrefix defaults to "/" and "bn"', () => {
  assert.equal(addLocalePrefix(), '/');
  assert.equal(addLocalePrefix('/about'), '/about');
});

// --- localeAlternates ---

test('localeAlternates returns bn/en/xDefault for root path', () => {
  const alt = localeAlternates('/');
  assert.equal(alt.bn, '/');
  assert.equal(alt.en, '/en/');
  assert.equal(alt.xDefault, '/');
});

test('localeAlternates returns bn/en/xDefault for content path', () => {
  const alt = localeAlternates('/about');
  assert.equal(alt.bn, '/about');
  assert.equal(alt.en, '/en/about');
  assert.equal(alt.xDefault, '/about');
});

test('localeAlternates normalizes English path back to both locales', () => {
  const alt = localeAlternates('/en/about');
  assert.equal(alt.bn, '/about');
  assert.equal(alt.en, '/en/about');
  assert.equal(alt.xDefault, '/about');
});

test('localeAlternates xDefault uses SITE_DEFAULT_LOCALE', () => {
  assert.equal(SITE_DEFAULT_LOCALE, 'bn');
  const alt = localeAlternates('/services');
  assert.equal(alt.xDefault, alt.bn);
});

// --- getPageLocale ---

test('getPageLocale delegates to getLocaleFromPathname', () => {
  assert.equal(getPageLocale('/'), 'bn');
  assert.equal(getPageLocale('/en'), 'en');
  assert.equal(getPageLocale('/en/about'), 'en');
  assert.equal(getPageLocale('/about'), 'bn');
});

// --- getLocaleMeta ---

test('getLocaleMeta returns meta for bn', () => {
  const meta = getLocaleMeta('bn');
  assert.equal(meta.code, 'bn');
  assert.equal(meta.lang, 'bn');
  assert.equal(meta.ogLocale, 'bn_BD');
  assert.equal(meta.prefix, '');
  assert.equal(meta.label, 'বাংলা');
});

test('getLocaleMeta returns meta for en', () => {
  const meta = getLocaleMeta('en');
  assert.equal(meta.code, 'en');
  assert.equal(meta.lang, 'en');
  assert.equal(meta.ogLocale, 'en_US');
  assert.equal(meta.prefix, '/en');
  assert.equal(meta.label, 'English');
});

test('getLocaleMeta normalizes unknown locale to bn', () => {
  const meta = getLocaleMeta('fr');
  assert.equal(meta.code, 'bn');
});

// --- Constants ---

test('LOCALES contains bn and en', () => {
  assert.deepEqual(LOCALES, ['bn', 'en']);
});

test('LOCALE_LABELS has labels for both locales', () => {
  assert.equal(LOCALE_LABELS.bn, 'বাংলা');
  assert.equal(LOCALE_LABELS.en, 'English');
});

test('LOCALE_META has entries for both locales', () => {
  assert.ok(LOCALE_META.bn);
  assert.ok(LOCALE_META.en);
});

test('SITE_DEFAULT_LOCALE is bn', () => {
  assert.equal(SITE_DEFAULT_LOCALE, 'bn');
});
