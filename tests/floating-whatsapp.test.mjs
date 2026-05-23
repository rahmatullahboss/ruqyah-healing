import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_FLOATING_WHATSAPP,
  normalizeFloatingWhatsappSettings,
} from '../src/lib/floating-whatsapp.js';

test('normalizeFloatingWhatsappSettings fills missing values from defaults', () => {
  const settings = normalizeFloatingWhatsappSettings({
    label: 'Book on WhatsApp',
  });

  assert.equal(settings.enabled, DEFAULT_FLOATING_WHATSAPP.enabled);
  assert.equal(settings.label, 'Book on WhatsApp');
  assert.equal(settings.number, DEFAULT_FLOATING_WHATSAPP.number);
  assert.equal(settings.message, DEFAULT_FLOATING_WHATSAPP.message);
});

test('normalizeFloatingWhatsappSettings preserves explicit values', () => {
  const settings = normalizeFloatingWhatsappSettings({
    enabled: false,
    label: 'Chat now',
    number: '8801555555555',
    message: 'Need help',
  });

  assert.deepEqual(settings, {
    enabled: false,
    label: 'Chat now',
    number: '8801555555555',
    message: 'Need help',
  });
});
