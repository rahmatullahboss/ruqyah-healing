import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSiteSchemas,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema,
  buildCollectionPageSchema,
  buildCreativeWorkSchema,
  buildWebPageSchema,
  buildLocalBusinessSchema,
  buildHowToSchema,
  buildVideoObjectSchema,
  buildAlternateLinks,
} from '../src/lib/seo.js';

const SITE = 'https://ruqyahhealing.com';

// --- buildSiteSchemas ---

test('buildSiteSchemas returns Organization, WebSite, and LocalBusiness', () => {
  const schemas = buildSiteSchemas(SITE, 'Ruqyah Healing', 'Test description');
  assert.equal(schemas.length, 3);
  assert.equal(schemas[0]['@type'], 'Organization');
  assert.equal(schemas[1]['@type'], 'WebSite');
  assert.equal(schemas[2]['@type'], 'LocalBusiness');
});

test('buildSiteSchemas Organization has correct fields', () => {
  const [org] = buildSiteSchemas(SITE, 'Ruqyah Healing', 'Desc');
  assert.equal(org.name, 'Ruqyah Healing');
  assert.equal(org.url, SITE);
  assert.equal(org.description, 'Desc');
  assert.match(org.logo.url, /ruqyah-logo\.png/);
  assert.ok(Array.isArray(org.sameAs));
});

test('buildSiteSchemas LocalBusiness has address, geo, hours', () => {
  const [, , biz] = buildSiteSchemas(SITE, 'Name', 'Desc');
  assert.equal(biz.address['@type'], 'PostalAddress');
  assert.equal(biz.address.addressCountry, 'BD');
  assert.equal(biz.geo['@type'], 'GeoCoordinates');
  assert.equal(biz.openingHoursSpecification['@type'], 'OpeningHoursSpecification');
  assert.ok(biz.openingHoursSpecification.dayOfWeek.length > 0);
});

// --- buildBreadcrumbSchema ---

test('buildBreadcrumbSchema creates correct list items', () => {
  const schema = buildBreadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Services', url: `${SITE}/services` },
    { name: 'Ruqyah', url: `${SITE}/services/ruqyah` },
  ]);
  assert.equal(schema['@type'], 'BreadcrumbList');
  assert.equal(schema.itemListElement.length, 3);
  assert.equal(schema.itemListElement[0].position, 1);
  assert.equal(schema.itemListElement[0].name, 'Home');
  assert.equal(schema.itemListElement[2].position, 3);
  assert.equal(schema.itemListElement[2].name, 'Ruqyah');
});

test('buildBreadcrumbSchema handles empty array', () => {
  const schema = buildBreadcrumbSchema([]);
  assert.equal(schema.itemListElement.length, 0);
});

// --- buildFaqSchema ---

test('buildFaqSchema creates FAQPage with questions and answers', () => {
  const schema = buildFaqSchema([
    { question: 'What is Ruqyah?', answer: 'Islamic healing.' },
    { question: 'Is it safe?', answer: 'Yes.' },
  ]);
  assert.equal(schema['@type'], 'FAQPage');
  assert.equal(schema.mainEntity.length, 2);
  assert.equal(schema.mainEntity[0]['@type'], 'Question');
  assert.equal(schema.mainEntity[0].name, 'What is Ruqyah?');
  assert.equal(schema.mainEntity[0].acceptedAnswer['@type'], 'Answer');
  assert.equal(schema.mainEntity[0].acceptedAnswer.text, 'Islamic healing.');
});

// --- buildServiceSchema ---

test('buildServiceSchema creates Service with provider', () => {
  const schema = buildServiceSchema({
    siteUrl: SITE,
    pageUrl: `${SITE}/services/ruqyah`,
    name: 'Ruqyah Session',
    description: 'Healing session',
  });
  assert.equal(schema['@type'], 'Service');
  assert.equal(schema.name, 'Ruqyah Session');
  assert.equal(schema.url, `${SITE}/services/ruqyah`);
  assert.equal(schema.provider['@type'], 'Organization');
  assert.equal(schema.areaServed, 'Bangladesh');
  assert.deepEqual(schema.availableLanguage, ['bn', 'en']);
});

test('buildServiceSchema allows custom areaServed and language', () => {
  const schema = buildServiceSchema({
    siteUrl: SITE,
    pageUrl: `${SITE}/test`,
    name: 'Test',
    description: 'Desc',
    areaServed: 'Worldwide',
    availableLanguage: ['bn'],
  });
  assert.equal(schema.areaServed, 'Worldwide');
  assert.deepEqual(schema.availableLanguage, ['bn']);
});

// --- buildCollectionPageSchema ---

test('buildCollectionPageSchema maps items to hasPart', () => {
  const schema = buildCollectionPageSchema({
    pageUrl: `${SITE}/conditions`,
    name: 'Conditions',
    description: 'All conditions',
    items: [
      { name: 'Evil Eye', url: `${SITE}/conditions/evil-eye`, type: 'MedicalCondition' },
      { name: 'Magic', url: `${SITE}/conditions/magic` },
    ],
  });
  assert.equal(schema['@type'], 'CollectionPage');
  assert.equal(schema.hasPart.length, 2);
  assert.equal(schema.hasPart[0]['@type'], 'MedicalCondition');
  assert.equal(schema.hasPart[1]['@type'], 'CreativeWork'); // default type
});

test('buildCollectionPageSchema handles empty items', () => {
  const schema = buildCollectionPageSchema({
    pageUrl: `${SITE}/test`,
    name: 'Test',
    description: 'Desc',
  });
  assert.deepEqual(schema.hasPart, []);
});

// --- buildCreativeWorkSchema ---

test('buildCreativeWorkSchema creates PDF resource schema', () => {
  const schema = buildCreativeWorkSchema({
    pageUrl: `${SITE}/resources/guide`,
    name: 'Healing Guide',
    description: 'A guide',
    fileUrl: `${SITE}/files/guide.pdf`,
    inLanguage: 'bn',
    category: 'Guide',
    pageCount: 10,
  });
  assert.equal(schema['@type'], 'CreativeWork');
  assert.equal(schema.name, 'Healing Guide');
  assert.equal(schema.encodingFormat, 'application/pdf');
  assert.equal(schema.numberOfPages, 10);
  assert.equal(schema.contentUrl, `${SITE}/files/guide.pdf`);
  assert.equal(schema.publisher.name, 'Ruqyah Healing Center');
});

// --- buildWebPageSchema ---

test('buildWebPageSchema creates basic WebPage', () => {
  const schema = buildWebPageSchema({
    pageUrl: `${SITE}/about`,
    name: 'About Us',
    description: 'About page',
    inLanguage: 'bn',
  });
  assert.equal(schema['@type'], 'WebPage');
  assert.equal(schema.name, 'About Us');
  assert.equal(schema.url, `${SITE}/about`);
  assert.equal(schema.inLanguage, 'bn');
});

// --- buildLocalBusinessSchema ---

test('buildLocalBusinessSchema creates full business schema', () => {
  const schema = buildLocalBusinessSchema({
    siteUrl: SITE,
    name: 'Ruqyah Healing Center',
    description: 'Healing center',
    telephone: '+8801992575874',
    email: 'info@ruqyahhealing.com',
    address: { city: 'ঢাকা', country: 'BD' },
    geo: { latitude: 23.81, longitude: 90.41 },
  });
  assert.equal(schema['@type'], 'LocalBusiness');
  assert.equal(schema.telephone, '+8801992575874');
  assert.equal(schema.address.addressLocality, 'ঢাকা');
  assert.equal(schema.geo.latitude, 23.81);
  assert.equal(schema.priceRange, '৳৳'); // default
  assert.equal(schema.areaServed.name, 'Bangladesh'); // default
});

test('buildLocalBusinessSchema uses defaults for optional fields', () => {
  const schema = buildLocalBusinessSchema({
    siteUrl: SITE,
    name: 'Test',
    description: 'Desc',
    telephone: '123',
    email: 't@t.com',
    address: { city: 'C', country: 'X' },
    geo: { latitude: 0, longitude: 0 },
  });
  assert.ok(schema.openingHoursSpecification.dayOfWeek.length > 0);
  assert.equal(schema.openingHoursSpecification.opens, '09:00');
  assert.equal(schema.openingHoursSpecification.closes, '18:00');
  assert.deepEqual(schema.sameAs, []);
});

// --- buildHowToSchema ---

test('buildHowToSchema creates HowTo with steps', () => {
  const schema = buildHowToSchema({
    name: 'How to Perform Ruqyah',
    description: 'Step by step',
    url: `${SITE}/how-to`,
    steps: [
      { name: 'Prepare', text: 'Make wudu' },
      { name: 'Recite', text: 'Recite Ayat al-Kursi' },
    ],
    estimatedTime: 'PT15M',
  });
  assert.equal(schema['@type'], 'HowTo');
  assert.equal(schema.estimatedTime, 'PT15M');
  assert.equal(schema.step.length, 2);
  assert.equal(schema.step[0].position, 1);
  assert.equal(schema.step[0].name, 'Prepare');
  assert.equal(schema.step[1].position, 2);
});

test('buildHowToSchema defaults estimatedTime to PT30M', () => {
  const schema = buildHowToSchema({
    name: 'Test',
    description: 'Desc',
    url: SITE,
    steps: [{ name: 'A', text: 'B' }],
  });
  assert.equal(schema.estimatedTime, 'PT30M');
});

test('buildHowToSchema includes image only when provided', () => {
  const withImage = buildHowToSchema({
    name: 'Test',
    description: 'Desc',
    url: SITE,
    steps: [{ name: 'A', text: 'B', image: 'https://example.com/img.png' }],
  });
  assert.equal(withImage.step[0].image, 'https://example.com/img.png');

  const withoutImage = buildHowToSchema({
    name: 'Test',
    description: 'Desc',
    url: SITE,
    steps: [{ name: 'A', text: 'B' }],
  });
  assert.equal(withoutImage.step[0].image, undefined);
});

// --- buildVideoObjectSchema ---

test('buildVideoObjectSchema creates VideoObject', () => {
  const schema = buildVideoObjectSchema({
    name: 'Ruqyah Video',
    description: 'A video',
    thumbnailUrl: 'https://img.youtube.com/vi/abc/default.jpg',
    uploadDate: '2025-01-01',
    duration: 'PT10M',
    contentUrl: 'https://www.youtube.com/watch?v=abc',
    embedUrl: 'https://www.youtube.com/embed/abc',
  });
  assert.equal(schema['@type'], 'VideoObject');
  assert.equal(schema.name, 'Ruqyah Video');
  assert.equal(schema.duration, 'PT10M');
  assert.equal(schema.publisher.name, 'Ruqyah Healing Center');
  assert.match(schema.publisher.logo.url, /ruqyah-logo\.png/);
});

test('buildVideoObjectSchema defaults duration to PT1M', () => {
  const schema = buildVideoObjectSchema({
    name: 'Test',
    description: 'Desc',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    uploadDate: '2025-01-01',
    contentUrl: 'https://example.com/video.mp4',
    embedUrl: 'https://example.com/embed',
  });
  assert.equal(schema.duration, 'PT1M');
});

// --- buildAlternateLinks ---

test('buildAlternateLinks returns canonical and alternates', () => {
  const result = buildAlternateLinks(SITE, '/about', 'bn');
  assert.equal(result.canonical, `${SITE}/about`);
  assert.equal(result.alternates.bn, '/about');
  assert.equal(result.alternates.en, '/en/about');
  assert.equal(result.current.code, 'bn');
});

test('buildAlternateLinks works for English locale', () => {
  const result = buildAlternateLinks(SITE, '/en/about', 'en');
  assert.equal(result.canonical, `${SITE}/en/about`);
  assert.equal(result.alternates.bn, '/about');
  assert.equal(result.alternates.en, '/en/about');
  assert.equal(result.current.code, 'en');
});
