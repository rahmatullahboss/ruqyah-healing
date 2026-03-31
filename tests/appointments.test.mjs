import test from 'node:test';
import assert from 'node:assert/strict';

import {
  appointmentSubmissionSchema,
  mapAppointmentToInsert,
  serializeAppointmentPayload,
} from '../src/lib/appointments.js';

test('serializeAppointmentPayload builds a normalized booking payload from raw form values', () => {
  const payload = serializeAppointmentPayload({
    fullName: 'টেস্ট রোগী',
    nid: '1234567890',
    age: '30',
    weight: '70',
    gender: 'পুরুষ',
    religion: 'মুসলিম',
    duration: '১ বছর',
    previousTreatment: 'হ্যাঁ',
    previousTreatmentDetails: 'আগে রুকইয়াহ করানো হয়েছে',
    serviceMode: 'চেম্বার সেবা',
    sessionFormat: 'ডায়াগনোসিস',
    treatmentTypeKey: 'ruqyah',
    treatmentTypeLabel: 'রুকইয়াহ',
    subServices: ['Diagnosis Session - ডায়াগনোসিস সেশন', 'Long Session - লং সেশন'],
    preferredDate: '2026-04-15',
    preferredTime: 'বিকেল ৪:০০',
    address: 'ঢাকা, বাংলাদেশ',
    phone: '01992575874',
    whatsapp: '01992575874',
    problem: 'ঘুমের সমস্যা',
    paymentMethod: 'বিকাশ',
    transactionId: 'TEST123',
    paymentTimestamp: '2026-04-10T10:30',
  });

  assert.equal(payload.fullName, 'টেস্ট রোগী');
  assert.equal(payload.treatmentTypeKey, 'ruqyah');
  assert.deepEqual(payload.subServices, [
    'Diagnosis Session - ডায়াগনোসিস সেশন',
    'Long Session - লং সেশন',
  ]);
  assert.equal(payload.paymentTimestamp, '2026-04-10T10:30');
});

test('appointmentSubmissionSchema rejects malformed booking data', () => {
  const result = appointmentSubmissionSchema.safeParse({
    fullName: '',
    age: '-1',
  });

  assert.equal(result.success, false);
});

test('appointmentSubmissionSchema requires previous treatment details when previous treatment is yes', () => {
  const result = appointmentSubmissionSchema.safeParse({
    fullName: 'টেস্ট রোগী',
    nid: '',
    age: '30',
    weight: '',
    gender: 'পুরুষ',
    religion: 'মুসলিম',
    duration: '১ বছর',
    previousTreatment: 'হ্যাঁ',
    previousTreatmentDetails: '',
    serviceMode: 'চেম্বার সেবা',
    sessionFormat: 'ডায়াগনোসিস',
    treatmentTypeKey: 'ruqyah',
    treatmentTypeLabel: 'রুকইয়াহ',
    subServices: [],
    preferredDate: '2026-04-15',
    preferredTime: 'বিকেল ৪:০০',
    address: 'ঢাকা, বাংলাদেশ',
    phone: '01992575874',
    whatsapp: '',
    problem: 'ঘুমের সমস্যা',
    paymentMethod: 'বিকাশ',
    transactionId: 'TEST123',
    paymentTimestamp: '2026-04-10T10:30',
  });

  assert.equal(result.success, false);
});

test('mapAppointmentToInsert prepares DB row with JSON-friendly fields', () => {
  const parsed = appointmentSubmissionSchema.parse({
    fullName: 'টেস্ট রোগী',
    nid: '1234567890',
    age: '30',
    weight: '70',
    gender: 'পুরুষ',
    religion: 'মুসলিম',
    duration: '১ বছর',
    previousTreatment: 'হ্যাঁ',
    previousTreatmentDetails: 'আগে রুকইয়াহ করানো হয়েছে',
    serviceMode: 'চেম্বার সেবা',
    sessionFormat: 'ডায়াগনোসিস',
    treatmentTypeKey: 'ruqyah',
    treatmentTypeLabel: 'রুকইয়াহ',
    subServices: ['Diagnosis Session - ডায়াগনোসিস সেশন'],
    preferredDate: '2026-04-15',
    preferredTime: 'বিকেল ৪:০০',
    address: 'ঢাকা, বাংলাদেশ',
    phone: '01992575874',
    whatsapp: '01992575874',
    problem: 'ঘুমের সমস্যা',
    paymentMethod: 'বিকাশ',
    transactionId: 'TEST123',
    paymentTimestamp: '2026-04-10T10:30',
  });

  const row = mapAppointmentToInsert(parsed, 'web');

  assert.equal(row.fullName, 'টেস্ট রোগী');
  assert.equal(row.treatmentTypeKey, 'ruqyah');
  assert.deepEqual(row.subServices, ['Diagnosis Session - ডায়াগনোসিস সেশন']);
  assert.equal(row.source, 'web');
  assert.equal(row.status, 'pending');
});
