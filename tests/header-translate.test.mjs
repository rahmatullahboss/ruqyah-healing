import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HEADER_PATH = new URL('../src/components/Header.astro', import.meta.url);
const headerSource = await readFile(HEADER_PATH, 'utf8');

const expectedLanguages = [
  { code: 'bn', shortLabel: 'BN', label: 'বাংলা' },
  { code: 'en', shortLabel: 'EN', label: 'English' },
  { code: 'ur', shortLabel: 'UR', label: 'اردو', target: 'tl=ur' },
  { code: 'ar', shortLabel: 'AR', label: 'العربية', target: 'tl=ar' },
];

test('Header exposes a visible translate switcher', () => {
  assert.match(headerSource, /<details class="translate-switcher" data-translate-switcher>/, 'Translate switcher should be visible in the header');
  assert.match(headerSource, /<summary class="translate-toggle" aria-label="Translate this page">/, 'Translate switcher should use an accessible summary button');
  assert.ok(headerSource.includes('translate-toggle-text">Translate</span>'), 'Translate label should be visible on desktop');
  assert.ok(!headerSource.includes('style="display:none;"'), 'Translate switcher should not be hidden inline');
});

test('Header includes Bangla, English, Urdu, and Arabic options', () => {
  for (const language of expectedLanguages) {
    assert.ok(headerSource.includes(`code: '${language.code}'`), `Missing language code: ${language.code}`);
    assert.ok(headerSource.includes(`shortLabel: '${language.shortLabel}'`), `Missing short label: ${language.shortLabel}`);
    assert.ok(headerSource.includes(`label: '${language.label}'`), `Missing language label: ${language.label}`);
  }
});

test('Bangla and English use internal locale alternates', () => {
  assert.ok(headerSource.includes("href: alternates.bn"), 'Bangla should use the existing Bangla alternate URL');
  assert.ok(headerSource.includes("href: alternates.en"), 'English should use the existing English alternate URL');
  assert.ok(headerSource.includes("option.code === pageLocale"), 'Current internal language should be highlighted as active');
});

test('Urdu and Arabic use safe external translate links', () => {
  assert.match(headerSource, /Astro\.site\?\.origin \|\| 'https:\/\/ruqyahhealing\.com'/, 'Translate URLs should be generated against the public site origin');
  assert.match(headerSource, /encodeURIComponent\(publicPageUrl\)/, 'Current page URL should be encoded before passing to the translate service');
  assert.ok(headerSource.includes('https://translate.google.com/translate?sl=auto&tl=ur&u=${encodedPublicPageUrl}'), 'Urdu should use Google Translate');
  assert.ok(headerSource.includes('https://translate.google.com/translate?sl=auto&tl=ar&u=${encodedPublicPageUrl}'), 'Arabic should use Google Translate');
  assert.match(headerSource, /dir=\{option\.dir\}/, 'RTL language options should expose their text direction');
  assert.match(headerSource, /target=\{option\.external \? '_blank' : undefined\}/, 'External translate links should open safely in a new tab');
  assert.match(headerSource, /rel=\{option\.external \? 'noopener noreferrer' : undefined\}/, 'External translate links should include noopener noreferrer');
});

test('Translate switcher has desktop and mobile styling safeguards', () => {
  assert.match(headerSource, /\.translate-switcher \{[\s\S]*position: relative;[\s\S]*flex-shrink: 0;/, 'Translate switcher should stay anchored in the header');
  assert.match(headerSource, /\.translate-menu \{[\s\S]*position: absolute;[\s\S]*right: 0;[\s\S]*z-index: 102;/, 'Translate menu should open above header content on desktop');
  assert.match(headerSource, /@media \(max-width: 768px\)[\s\S]*\.translate-toggle-text \{[\s\S]*display: none;/, 'Mobile header should hide the long translate label');
  assert.match(headerSource, /@media \(max-width: 768px\)[\s\S]*\.translate-menu \{[\s\S]*right: -48px;/, 'Mobile translate menu should remain reachable beside the menu button');
});

test('Translate switcher closes on outside click, menu click, and Escape', () => {
  assert.match(headerSource, /const translateSwitcher = document\.querySelector\('\[data-translate-switcher\]'\)/, 'Script should find the translate switcher');
  assert.match(headerSource, /function closeTranslateSwitcher\(\) \{[\s\S]*translateSwitcher\.open = false;[\s\S]*\}/, 'Script should provide a close helper');
  assert.match(headerSource, /document\.addEventListener\('click', closeTranslateSwitcher\)/, 'Outside clicks should close the translate menu');
  assert.match(headerSource, /document\.querySelectorAll\('\[data-translate-option\]'\)/, 'Language option clicks should close the translate menu');
  assert.match(headerSource, /if \(e\.key !== 'Escape'\) return;[\s\S]*closeTranslateSwitcher\(\);/, 'Escape key should close the translate menu');
});
