import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_CLINIC_CONTACTS,
  getPrimaryCallContact,
  getPrimaryWhatsappContact,
  normalizeClinicContacts,
} from '../src/lib/clinic-contacts.js';

test('normalizeClinicContacts preserves explicit contact types', () => {
  const contacts = normalizeClinicContacts([
    { label: 'কল', display: '01700000000', international: '8801700000000', type: 'call' },
    { label: 'হোয়াটসঅ্যাপ', display: '01800000000', international: '8801800000000', type: 'whatsapp' },
  ]);

  assert.equal(contacts[0].type, 'call');
  assert.equal(contacts[1].type, 'whatsapp');
});

test('normalizeClinicContacts defaults legacy rows to both', () => {
  const contacts = normalizeClinicContacts([
    { label: 'প্রধান যোগাযোগ', display: '01992575874', international: '8801992575874' },
  ]);

  assert.equal(contacts[0].type, 'both');
});

test('normalizeClinicContacts falls back to defaults when input is empty', () => {
  const contacts = normalizeClinicContacts([]);

  assert.deepEqual(contacts, DEFAULT_CLINIC_CONTACTS);
});

test('primary contact helpers choose the right contact type', () => {
  const contacts = normalizeClinicContacts([
    { label: 'কল সাপোর্ট', display: '01700000000', international: '8801700000000', type: 'call' },
    { label: 'WhatsApp বুকিং', display: '01800000000', international: '8801800000000', type: 'whatsapp' },
  ]);

  assert.equal(getPrimaryCallContact(contacts)?.display, '01700000000');
  assert.equal(getPrimaryWhatsappContact(contacts)?.display, '01800000000');
});
