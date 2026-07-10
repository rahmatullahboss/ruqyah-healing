import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const INDEX_PATH = new URL('../src/pages/index.astro', import.meta.url);
const TEAM_PATH = new URL('../src/pages/team.astro', import.meta.url);
const PUBLIC_DIR = new URL('../public/', import.meta.url);

const homepageSource = await readFile(INDEX_PATH, 'utf8');
const teamSource = await readFile(TEAM_PATH, 'utf8');

const realisticServiceImages = [
  '/images/ruqyah-info.webp',
  '/images/hijama-main.webp',
  '/images/hijama-secondary.webp',
  '/images/gallery-session.webp',
  '/images/services/ruqyah-diagnosis.jpeg',
  '/images/services/ruqyah-supplement.jpeg',
  '/images/services/ruqyah-download.jpeg',
  '/images/services/consultation.jpeg',
];

function indexOfRequired(source, marker) {
  const index = source.indexOf(marker);
  assert.notEqual(index, -1, `Missing marker: ${marker}`);
  return index;
}

test('Homepage keeps the requested Bangla section serial after services', () => {
  const serviceIndex = indexOfRequired(homepageSource, '<h2>আমাদের সেবাসমূহ</h2>');
  const videosIndex = indexOfRequired(homepageSource, '<h2>আমাদের ভিডিওসমূহ</h2>');
  const blogIndex = indexOfRequired(homepageSource, '<h2>রুকইয়াহ ব্লগ</h2>');
  const packagesIndex = indexOfRequired(homepageSource, '<h2>আমাদের প্যাকেজ</h2>');
  const productsIndex = indexOfRequired(homepageSource, '<h2>আমাদের প্রোডাক্টসমূহ</h2>');
  const coursesIndex = indexOfRequired(homepageSource, '<h2>আমাদের কোর্সসমূহ</h2>');
  const raqiIndex = indexOfRequired(homepageSource, '<span class="section-kicker">রাকী পরিচয়</span>');

  assert.ok(serviceIndex < videosIndex, 'Services should come before videos');
  assert.ok(videosIndex < blogIndex, 'Videos should come before blog');
  assert.ok(blogIndex < packagesIndex, 'Blog should come before packages');
  assert.ok(packagesIndex < productsIndex, 'Packages should come before products');
  assert.ok(productsIndex < coursesIndex, 'Products should come before courses');
  assert.ok(coursesIndex < raqiIndex, 'Courses should come before Raqi profile');
});

test('Homepage service cards use realistic image assets instead of old service SVGs', async () => {
  for (const image of realisticServiceImages) {
    assert.ok(homepageSource.includes(`image: '${image}'`), `${image} should be used by the services array`);
    await assert.doesNotReject(access(new URL(`.${image}`, PUBLIC_DIR)), `${image} should exist in public assets`);
  }

  assert.doesNotMatch(homepageSource, /image: '\/images\/services\/service-[^']+\.svg'/, 'Services should not regress to old SVG placeholder assets');
  assert.ok(homepageSource.includes('বাস্তবধর্মী রুকইয়াহ সেশন'), 'Service copy should describe realistic care visuals');
});

test('Homepage text corrections stay professional and typo-free', () => {
  assert.ok(homepageSource.includes('<h2>রুকইয়াহ কী?</h2>'), 'Ruqyah definition heading should use correct spelling');
  assert.ok(homepageSource.includes('<h2>রুকইয়াহ ব্লগ</h2>'), 'Blog heading should use correct spelling');
  assert.ok(homepageSource.includes('<h2>আমাদের প্রোডাক্টসমূহ</h2>'), 'Products heading should include আমাদের');
  assert.ok(homepageSource.includes('<h2>আমাদের কোর্সসমূহ</h2>'), 'Courses heading should use compact professional spelling');
  assert.ok(homepageSource.includes('<a href="/team" class="btn btn-outline">আরো দেখুন</a>'), 'Raqi profile CTA should be আরো দেখুন');

  assert.ok(!homepageSource.includes('রুকইয়া ব্লগ'), 'Old রুকইয়া spelling should not return in blog heading');
  assert.ok(!homepageSource.includes('রুকাইয়া'), 'Wrong Rukaiya transliteration should not appear');
  assert.ok(!homepageSource.includes('আমাদের সেবা প্যাকেজ'), 'Package heading should not include সেবা');
  assert.ok(!homepageSource.includes('পূর্ণ পরিচয় দেখুন'), 'Old full-profile CTA should not return on homepage');
});

test('Homepage package section avoids Sheba wording in package labels', () => {
  const packageSectionStart = indexOfRequired(homepageSource, '<!-- ⑥ আমাদের প্যাকেজ -->');
  const packageSectionEnd = indexOfRequired(homepageSource, '<!-- ⑦ আমাদের প্রোডাক্টসমূহ -->');
  const packageSection = homepageSource.slice(packageSectionStart, packageSectionEnd);

  assert.ok(packageSection.includes('<h2>আমাদের প্যাকেজ</h2>'));
  assert.ok(packageSection.includes('🏢 চেম্বার'));
  assert.ok(packageSection.includes('🏠 হোম ভিজিট'));
  assert.ok(packageSection.includes('📋 সব অপশন দেখুন'));

  assert.ok(!packageSection.includes('আমাদের সেবা প্যাকেজ'), 'Package heading should not include সেবা');
  assert.ok(!packageSection.includes('চেম্বার সেবা'), 'Package action should not say চেম্বার সেবা');
  assert.ok(!packageSection.includes('হোম সার্ভিস'), 'Package action should not say হোম সার্ভিস');
});

test('Team page adds a separate Raqi details grid after the intro', () => {
  const introIndex = indexOfRequired(teamSource, 'class="profile-intro"');
  const detailsIndex = indexOfRequired(teamSource, 'class="raqi-details-panel"');
  const specializationsIndex = indexOfRequired(teamSource, 'class="specializations"');

  assert.ok(introIndex < detailsIndex, 'Details grid should come after the intro copy');
  assert.ok(detailsIndex < specializationsIndex, 'Details grid should come before specializations');
  assert.ok(teamSource.includes('const raqiDetails = ['), 'Team page should use a maintainable Raqi details data array');
  assert.ok(teamSource.includes('<h3>রাকীর বিস্তারিত পরিচিতি</h3>'), 'Grid should have a clear Bangla heading');

  for (const title of ['রুকইয়াহ শারীয়াহ', 'ডায়াগনোসিস ও কেস স্টাডি', 'হিজামা ও থেরাপি সাপোর্ট', 'Follow-up Guidance']) {
    assert.ok(teamSource.includes(title), `Missing Raqi detail card: ${title}`);
  }

  assert.match(teamSource, /\.raqi-details-grid[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/, 'Desktop details grid should render as two columns');
  assert.match(teamSource, /@media \(max-width: 640px\)[\s\S]*\.raqi-details-grid[\s\S]*grid-template-columns: 1fr;/, 'Mobile details grid should collapse to one column');
});
