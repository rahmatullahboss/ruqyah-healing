import { z } from 'zod';
import {
  durationOptions,
  genderOptions,
  paymentMethods,
  preferredTimeSlots,
  religionOptions,
  serviceModes,
  sessionFormats,
  treatmentCatalog,
} from '../data/clinic.js';

const requiredString = (label, min = 1, max = 5000) =>
  z
    .string({ required_error: `${label} প্রয়োজন` })
    .trim()
    .min(min, `${label} প্রয়োজন`)
    .max(max, `${label} অনেক বড়`);

const optionalString = (max = 5000) => z.string().trim().max(max).optional().default('');
const treatmentByKey = new Map(treatmentCatalog.map((item) => [item.value, item]));
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯';

export const APPOINTMENT_BLOCKING_STATUSES = ['pending', 'confirmed', 'completed'];

export function isAppointmentSlotBlockingStatus(status) {
  return APPOINTMENT_BLOCKING_STATUSES.includes(String(status || ''));
}

export function normalizeBangladeshPhone(value) {
  let phone = String(value || '').trim().replace(/[\s()-]/g, '');
  if (phone.startsWith('+880')) phone = `0${phone.slice(4)}`;
  else if (phone.startsWith('880')) phone = `0${phone.slice(3)}`;
  return phone;
}

function toAsciiDigits(value) {
  return String(value || '').replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)));
}

function isValidAge(value) {
  const age = Number(toAsciiDigits(value));
  return Number.isInteger(age) && age >= 1 && age <= 120;
}

function bangladeshPhoneSchema(label, optional = false) {
  const schema = z
    .string()
    .trim()
    .transform(normalizeBangladeshPhone)
    .refine((value) => /^01[3-9]\d{8}$/.test(value), `${label} সঠিক নয়`);
  return optional ? z.union([z.literal(''), schema]).default('') : schema;
}

export const appointmentSubmissionSchema = z
  .object({
    fullName: requiredString('পূর্ণ নাম', 2, 100),
    nid: optionalString(30),
    age: requiredString('বয়স', 1, 3).refine(isValidAge, 'বয়স ১ থেকে ১২০-এর মধ্যে হতে হবে'),
    weight: optionalString(20),
    gender: z.enum(genderOptions, { error: 'সঠিক লিঙ্গ নির্বাচন করুন' }),
    religion: z.enum(religionOptions, { error: 'সঠিক ধর্ম নির্বাচন করুন' }),
    duration: z.enum(durationOptions, { error: 'সমস্যার স্থায়িত্ব নির্বাচন করুন' }),
    previousTreatment: z.enum(['হ্যাঁ', 'না'], {
      error: 'পূর্বের চিকিৎসার তথ্য প্রয়োজন',
    }),
    previousTreatmentDetails: optionalString(2000),
    serviceMode: z.enum(serviceModes, { error: 'সেবা নেওয়ার মাধ্যম নির্বাচন করুন' }),
    sessionFormat: z.enum(sessionFormats, { error: 'সেশনের ধরন নির্বাচন করুন' }),
    treatmentTypeKey: z.enum(treatmentCatalog.map((item) => item.value), {
      error: 'চিকিৎসার ধরন নির্বাচন করুন',
    }),
    treatmentTypeLabel: requiredString('চিকিৎসার ধরন', 1, 100),
    subServices: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
    preferredDate: requiredString('পছন্দের তারিখ', 10, 10).regex(DATE_PATTERN, 'তারিখ YYYY-MM-DD ফরম্যাটে হতে হবে'),
    preferredTime: z.enum(preferredTimeSlots, { error: 'সঠিক সময় নির্বাচন করুন' }),
    address: requiredString('ঠিকানা', 3, 1000),
    phone: bangladeshPhoneSchema('মোবাইল নাম্বার'),
    whatsapp: bangladeshPhoneSchema('WhatsApp নাম্বার', true),
    problem: requiredString('প্রধান সমস্যা', 3, 5000),
    paymentMethod: z.enum(paymentMethods, { error: 'পেমেন্ট মাধ্যম নির্বাচন করুন' }),
    transactionId: requiredString('Trx ID', 3, 100),
    paymentTimestamp: requiredString('পেমেন্টের সময়', 1, 100),
    eventId: optionalString(200),
  })
  .superRefine((payload, context) => {
    if (payload.previousTreatment === 'হ্যাঁ' && !payload.previousTreatmentDetails) {
      context.addIssue({
        code: 'custom',
        path: ['previousTreatmentDetails'],
        message: 'পূর্বের চিকিৎসার বিবরণ প্রয়োজন',
      });
    }

    const treatment = treatmentByKey.get(payload.treatmentTypeKey);
    if (!treatment || treatment.label !== payload.treatmentTypeLabel) {
      context.addIssue({
        code: 'custom',
        path: ['treatmentTypeLabel'],
        message: 'চিকিৎসার ধরন সঠিক নয়',
      });
    }

    if (treatment) {
      const allowedOptions = new Set(treatment.options || []);
      const invalidOption = payload.subServices.find((item) => !allowedOptions.has(item));
      if (invalidOption) {
        context.addIssue({
          code: 'custom',
          path: ['subServices'],
          message: 'নির্বাচিত সাব-সার্ভিস সঠিক নয়',
        });
      }
    }
  });

export function getDhakaDateString(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function validateAppointmentDate(preferredDate, now = new Date()) {
  const date = String(preferredDate || '').trim();

  if (!DATE_PATTERN.test(date)) return 'তারিখ সঠিক নয়।';

  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return 'তারিখ সঠিক নয়।';
  }

  const today = getDhakaDateString(now);
  if (date < today) return 'অতীতের তারিখে বুকিং করা যাবে না।';

  const latestAllowed = new Date(`${today}T00:00:00Z`);
  latestAllowed.setUTCDate(latestAllowed.getUTCDate() + 365);
  if (date > latestAllowed.toISOString().slice(0, 10)) {
    return 'সর্বোচ্চ ১ বছরের মধ্যে বুকিং করুন।';
  }

  return '';
}

export function validateAppointmentSchedule(preferredDate, preferredTime, now = new Date()) {
  const dateError = validateAppointmentDate(preferredDate, now);
  if (dateError) return dateError;
  if (!preferredTimeSlots.includes(String(preferredTime || '').trim())) return 'নির্বাচিত সময় সঠিক নয়।';
  return '';
}

export function getAppointmentSlotLockKey(preferredDate, preferredTime) {
  return `appointment-slot:${String(preferredDate || '').trim()}:${String(preferredTime || '').trim()}`;
}

export function serializeAppointmentPayload(rawValues) {
  const payload = {
    fullName: rawValues.fullName ?? '',
    nid: rawValues.nid ?? '',
    age: rawValues.age ?? '',
    weight: rawValues.weight ?? '',
    gender: rawValues.gender ?? '',
    religion: rawValues.religion ?? '',
    duration: rawValues.duration ?? '',
    previousTreatment: rawValues.previousTreatment ?? 'না',
    previousTreatmentDetails: rawValues.previousTreatmentDetails ?? '',
    serviceMode: rawValues.serviceMode ?? '',
    sessionFormat: rawValues.sessionFormat ?? '',
    treatmentTypeKey: rawValues.treatmentTypeKey ?? '',
    treatmentTypeLabel: rawValues.treatmentTypeLabel ?? '',
    subServices: Array.isArray(rawValues.subServices)
      ? rawValues.subServices.filter(Boolean).map((item) => String(item).trim())
      : [],
    preferredDate: rawValues.preferredDate ?? '',
    preferredTime: rawValues.preferredTime ?? '',
    address: rawValues.address ?? '',
    phone: rawValues.phone ?? '',
    whatsapp: rawValues.whatsapp ?? rawValues.phone ?? '',
    problem: rawValues.problem ?? '',
    paymentMethod: rawValues.paymentMethod ?? '',
    transactionId: rawValues.transactionId ?? '',
    paymentTimestamp: rawValues.paymentTimestamp ?? '',
    eventId: rawValues.eventId ?? '',
  };

  return appointmentSubmissionSchema.parse(payload);
}

export function mapAppointmentToInsert(payload, source = 'web') {
  return {
    id: crypto.randomUUID(),
    fullName: payload.fullName,
    nid: payload.nid,
    age: payload.age,
    weight: payload.weight,
    gender: payload.gender,
    religion: payload.religion,
    duration: payload.duration,
    previousTreatment: payload.previousTreatment === 'হ্যাঁ',
    previousTreatmentDetails:
      payload.previousTreatment === 'হ্যাঁ' ? payload.previousTreatmentDetails : '',
    serviceMode: payload.serviceMode,
    sessionFormat: payload.sessionFormat,
    treatmentTypeKey: payload.treatmentTypeKey,
    treatmentTypeLabel: payload.treatmentTypeLabel,
    subServices: payload.subServices,
    preferredDate: payload.preferredDate,
    preferredTime: payload.preferredTime,
    address: payload.address,
    phone: payload.phone,
    whatsapp: payload.whatsapp || payload.phone,
    problem: payload.problem,
    paymentMethod: payload.paymentMethod,
    transactionId: payload.transactionId,
    paymentTimestamp: payload.paymentTimestamp,
    source,
    status: 'pending',
  };
}

export function buildAppointmentSlotStates(timeSlots = [], appointmentRows = [], selectedDate = '') {
  const date = String(selectedDate || '').trim();

  if (!date) {
    return timeSlots.map((slot) => ({
      value: slot,
      label: slot,
      available: true,
      reason: '',
    }));
  }

  const bookedByTime = new Map();
  for (const appointment of appointmentRows) {
    if (appointment?.preferredDate !== date) continue;
    if (!isAppointmentSlotBlockingStatus(appointment?.status)) continue;
    if (!appointment?.preferredTime) continue;
    bookedByTime.set(appointment.preferredTime, appointment.status);
  }

  return timeSlots.map((slot) => {
    const reason = bookedByTime.get(slot) || '';
    return {
      value: slot,
      label: slot,
      available: !reason,
      reason,
    };
  });
}
