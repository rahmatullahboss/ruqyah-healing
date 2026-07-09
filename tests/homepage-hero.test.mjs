import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const HERO_PATH = new URL('../src/components/Hero.astro', import.meta.url);
const PUBLIC_DIR = new URL('../public/', import.meta.url);
const heroSource = await readFile(HERO_PATH, 'utf8');

const expectedSlideImages = [
  '/images/hero-ruqyah-healing-bg.webp',
  '/images/prayer-landscape.webp',
  '/images/ruqyah-info.webp',
  '/images/hijama-main.webp',
];

const expectedTypewriterPoints = [
  'পরিবারে অশান্তি বা কলহ?',
  'বিয়েতে বাধা বা সন্তান না হওয়া?',
  'ব্যবসায়ে মন্দা বা সৌভাগ্যে বাধা?',
  'অসহ্য শারীরিক যন্ত্রণা?',
];

test('Homepage hero keeps the background slider structure in place', () => {
  assert.match(
    heroSource,
    /<section class="hero" data-active-slide="0" aria-label="রুকইয়াহ হিলিং পরিচিতি">/,
    'Hero section should expose a default active slide and accessible label',
  );
  assert.match(heroSource, /class="hero-bg-slider" aria-hidden="true"/, 'Slider wrapper should be decorative');

  const slideLayerCount = (heroSource.match(/class="hero-bg-slide"/g) || []).length;
  assert.equal(slideLayerCount, expectedSlideImages.length, 'Hero should keep one background layer per typewriter point');

  for (const image of expectedSlideImages) {
    assert.match(heroSource, new RegExp(`--hero-slide-image: url\\('${image}'\\)`), `${image} should be registered as a hero slide`);
  }
});

test('Homepage hero slide image files exist in public assets', async () => {
  for (const image of expectedSlideImages) {
    const assetPath = new URL(`.${image}`, PUBLIC_DIR);
    await assert.doesNotReject(access(assetPath), `${image} should exist in public assets`);
  }
});

test('Homepage hero maps every typewriter point to a matching slide', () => {
  for (const [index] of expectedTypewriterPoints.entries()) {
    const selector = `.hero[data-active-slide="${index}"] .hero-bg-slide:nth-child(${index + 1})`;
    assert.ok(heroSource.includes(selector), `Missing CSS selector for slide ${index}`);
  }

  for (const point of expectedTypewriterPoints) {
    assert.ok(heroSource.includes(point), `Missing typewriter point: ${point}`);
  }

  assert.match(heroSource, /hero\.setAttribute\('data-active-slide', String\(index % texts\.length\)\)/, 'Script should sync active slide with typewriter index');
  assert.match(heroSource, /updateHeroSlide\(textIndex\);/, 'Script should update the slide when typewriter advances');
});

test('Homepage hero script avoids duplicate initialization and respects reduced motion', () => {
  assert.match(heroSource, /el\.dataset\.typewriterStarted === 'true'/, 'Typewriter should not start twice after Astro page loads');
  assert.match(heroSource, /el\.dataset\.typewriterStarted = 'true'/, 'Typewriter should mark itself as initialized');
  assert.match(heroSource, /if \(prefersReduced\) \{\s*el\.textContent = texts\[0\];\s*return;\s*\}/s, 'Reduced-motion users should see stable text instead of animation');
});

test('Homepage hero readability regressions are guarded', () => {
  assert.match(heroSource, /linear-gradient\(90deg, rgba\(2, 34, 27, 0\.94\)/, 'Hero should keep a strong dark overlay for text contrast');
  assert.match(heroSource, /background: linear-gradient\(135deg, rgba\(3, 56, 44, 0\.92\)/, 'Hero copy card should stay sufficiently solid');
  assert.match(heroSource, /\.hero-title[\s\S]*text-shadow: 0 2px 8px rgba\(0,0,0,0\.48\);/, 'Hero title should keep a readability text shadow');
  assert.match(heroSource, /\.hero-subtitle[\s\S]*text-shadow: 0 2px 10px rgba\(0,0,0,0\.52\);/, 'Hero subtitle should keep a readability text shadow');
  assert.match(heroSource, /@media \(max-width: 768px\)[\s\S]*linear-gradient\(180deg, rgba\(2, 34, 27, 0\.92\)/, 'Mobile view should keep a strong overlay');
  assert.ok(heroSource.includes('পদ্ধতিতে'), 'Correct Bengali wording should be present');
  assert.ok(!heroSource.includes('পদ্ধতে'), 'Old typo should not return');
});
