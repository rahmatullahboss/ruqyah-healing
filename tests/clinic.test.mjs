import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAppointmentWhatsappMessage,
  getWhatsappUrl,
  primaryContact,
} from '../src/data/clinic.js';

test('buildAppointmentWhatsappMessage includes selected booking details', () => {
  const message = buildAppointmentWhatsappMessage({
    appointmentId: 'appt_123',
    fullName: 'রহিম উদ্দিন',
    nid: '1234567890',
    age: '৩২',
    weight: '৭৪',
    gender: 'পুরুষ',
    religion: 'মুসলিম',
    duration: '২ বছর',
    serviceMode: 'চেম্বার সেবা',
    sessionFormat: 'ডায়াগনোসিস',
    treatmentType: 'রুকইয়াহ',
    subServices: ['Diagnosis Session - ডায়াগনোসিস সেশন', 'Long Session - লং সেশন'],
    preferredDate: '2026-04-01',
    preferredTime: 'বিকেল ৪:০০',
    address: 'যাত্রাবাড়ী, ঢাকা',
    phone: '01992575874',
    whatsapp: '01992575874',
    problem: 'ঘুমের সমস্যা ও অস্থিরতা',
    previousTreatment: 'হ্যাঁ',
    previousTreatmentDetails: 'ইমামের কাছে ঝাড়ফুঁক করানো হয়েছে',
    paymentMethod: 'বিকাশ',
    transactionId: 'ABCD1234',
    paymentTimestamp: '2026-03-31 14:30',
  });

  assert.match(message, /appt_123/);
  assert.match(message, /রহিম উদ্দিন/);
  assert.match(message, /রুকইয়াহ/);
  assert.match(message, /Long Session - লং সেশন/);
  assert.match(message, /ইমামের কাছে ঝাড়ফুঁক করানো হয়েছে/);
  assert.match(message, /ABCD1234/);
});

test('getWhatsappUrl encodes the message for the configured number', () => {
  const url = getWhatsappUrl('অ্যাপয়েন্টমেন্ট বুক করতে চাই');

  assert.equal(
    url,
    `https://wa.me/${primaryContact.international}?text=%E0%A6%85%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%AA%E0%A6%AF%E0%A6%BC%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F%E0%A6%AE%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F%20%E0%A6%AC%E0%A7%81%E0%A6%95%20%E0%A6%95%E0%A6%B0%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87`
  );
});
