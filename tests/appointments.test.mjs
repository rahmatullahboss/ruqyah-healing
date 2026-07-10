import test from 'node:test';
import assert from 'node:assert/strict';

import {
  appointmentSubmissionSchema,
  buildAppointmentSlotStates,
  mapAppointmentToInsert,
  normalizeBangladeshPhone,
  serializeAppointmentPayload,
  validateAppointmentDate,
  validateAppointmentSchedule,
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
    eventId: 'lead-test-event',
  });

  assert.equal(payload.fullName, 'টেস্ট রোগী');
  assert.equal(payload.treatmentTypeKey, 'ruqyah');
  assert.deepEqual(payload.subServices, [
    'Diagnosis Session - ডায়াগনোসিস সেশন',
    'Long Session - লং সেশন',
  ]);
  assert.equal(payload.paymentTimestamp, '2026-04-10T10:30');
  assert.equal(payload.eventId, 'lead-test-event');
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

test('buildAppointmentSlotStates disables slots already held by active bookings', () => {
  const slots = buildAppointmentSlotStates(
    ['সকাল ৯:০০', 'সকাল ১০:০০', 'সকাল ১১:০০'],
    [
      { preferredDate: '2026-05-24', preferredTime: 'সকাল ৯:০০', status: 'pending' },
      { preferredDate: '2026-05-24', preferredTime: 'সকাল ১০:০০', status: 'confirmed' },
      { preferredDate: '2026-05-24', preferredTime: 'সকাল ১১:০০', status: 'cancelled' },
      { preferredDate: '2026-05-25', preferredTime: 'সকাল ১১:০০', status: 'confirmed' },
    ],
    '2026-05-24',
  );

  assert.deepEqual(slots, [
    { value: 'সকাল ৯:০০', label: 'সকাল ৯:০০', available: false, reason: 'pending' },
    { value: 'সকাল ১০:০০', label: 'সকাল ১০:০০', available: false, reason: 'confirmed' },
    { value: 'সকাল ১১:০০', label: 'সকাল ১১:০০', available: true, reason: '' },
  ]);
});

test('buildAppointmentSlotStates keeps all slots available until a date is selected', () => {
  const slots = buildAppointmentSlotStates(
    ['সকাল ৯:০০'],
    [{ preferredDate: '2026-05-24', preferredTime: 'সকাল ৯:০০', status: 'confirmed' }],
    '',
  );

  assert.deepEqual(slots, [
    { value: 'সকাল ৯:০০', label: 'সকাল ৯:০০', available: true, reason: '' },
  ]);
});

test('normalizeBangladeshPhone accepts local and country-code formats', () => {
  assert.equal(normalizeBangladeshPhone('+880 1992-575874'), '01992575874');
  assert.equal(normalizeBangladeshPhone('8801992575874'), '01992575874');
  assert.equal(normalizeBangladeshPhone('01992575874'), '01992575874');
});

test('appointment date validation rejects past and far-future dates in Dhaka time', () => {
  const now = new Date('2026-07-10T06:00:00.000Z');
  assert.equal(validateAppointmentDate('2026-07-09', now), 'অতীতের তারিখে বুকিং করা যাবে না।');
  assert.equal(validateAppointmentDate('2027-07-11', now), 'সর্বোচ্চ ১ বছরের মধ্যে বুকিং করুন।');
  assert.equal(validateAppointmentDate('2026-07-10', now), '');
});

test('appointment schedule validation rejects unknown time slots', () => {
  const now = new Date('2026-07-10T06:00:00.000Z');
  assert.equal(validateAppointmentSchedule('2026-07-11', 'রাত ৩:০০', now), 'নির্বাচিত সময় সঠিক নয়।');
});

test('appointment schema rejects a mismatched treatment label', () => {
  const result = appointmentSubmissionSchema.safeParse({
    fullName: 'টেস্ট রোগী',
    nid: '',
    age: '৩০',
    weight: '',
    gender: 'পুরুষ',
    religion: 'মুসলিম',
    duration: '১ বছর',
    previousTreatment: 'না',
    previousTreatmentDetails: '',
    serviceMode: 'চেম্বার সেবা',
    sessionFormat: 'ডায়াগনোসিস',
    treatmentTypeKey: 'ruqyah',
    treatmentTypeLabel: 'হিজামা',
    subServices: [],
    preferredDate: '2026-07-15',
    preferredTime: 'বিকেল ৪:০০',
    address: 'ঢাকা, বাংলাদেশ',
    phone: '+8801992575874',
    whatsapp: '',
    problem: 'ঘুমের সমস্যা',
    paymentMethod: 'বিকাশ',
    transactionId: 'TEST123',
    paymentTimestamp: '2026-07-10T10:30',
  });

  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((issue) => issue.path[0] === 'treatmentTypeLabel'));
});
