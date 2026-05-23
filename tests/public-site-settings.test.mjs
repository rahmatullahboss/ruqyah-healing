import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPublicSiteSettings, DEFAULT_PAYMENT_DETAILS } from '../src/lib/public-site-settings.js';

test('buildPublicSiteSettings uses saved clinic phones instead of static defaults', () => {
  const settings = buildPublicSiteSettings({
    clinic_phones: [
      { label: 'প্রধান যোগাযোগ', display: '01711111111', international: '8801711111111', type: 'both' },
    ],
  });

  assert.equal(settings.clinicPhones[0].display, '01711111111');
  assert.equal(settings.clinicPhones[0].international, '8801711111111');
});

test('buildPublicSiteSettings falls back to default payment details', () => {
  const settings = buildPublicSiteSettings({});

  assert.equal(settings.paymentDetails.accountPhone, DEFAULT_PAYMENT_DETAILS.accountPhone);
  assert.equal(settings.paymentDetails.bookingFee, DEFAULT_PAYMENT_DETAILS.bookingFee);
});
