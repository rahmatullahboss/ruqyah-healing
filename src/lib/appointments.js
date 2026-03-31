import { z } from 'zod';

const requiredString = (label, min = 1) =>
  z
    .string({ required_error: `${label} প্রয়োজন` })
    .trim()
    .min(min, `${label} প্রয়োজন`);

const optionalString = () => z.string().trim().optional().default('');

export const appointmentSubmissionSchema = z
  .object({
    fullName: requiredString('পূর্ণ নাম'),
    nid: optionalString(),
    age: requiredString('বয়স'),
    weight: optionalString(),
    gender: requiredString('লিঙ্গ'),
    religion: requiredString('রিলিজিয়ন'),
    duration: requiredString('সমস্যার স্থায়িত্ব'),
    previousTreatment: z.enum(['হ্যাঁ', 'না'], {
      required_error: 'পূর্বের চিকিৎসার তথ্য প্রয়োজন',
    }),
    previousTreatmentDetails: optionalString(),
    serviceMode: requiredString('সেবা নেওয়ার মাধ্যম'),
    sessionFormat: requiredString('সেশনের ধরন'),
    treatmentTypeKey: requiredString('চিকিৎসার key'),
    treatmentTypeLabel: requiredString('চিকিৎসার ধরন'),
    subServices: z.array(z.string().trim()).default([]),
    preferredDate: requiredString('পছন্দের তারিখ'),
    preferredTime: requiredString('পছন্দের সময়'),
    address: requiredString('ঠিকানা'),
    phone: requiredString('মোবাইল নাম্বার'),
    whatsapp: optionalString(),
    problem: requiredString('প্রধান সমস্যা'),
    paymentMethod: requiredString('পেমেন্ট মাধ্যম'),
    transactionId: requiredString('Trx ID'),
    paymentTimestamp: requiredString('পেমেন্টের সময়'),
  })
  .superRefine((payload, context) => {
    if (payload.previousTreatment === 'হ্যাঁ' && !payload.previousTreatmentDetails) {
      context.addIssue({
        code: 'custom',
        path: ['previousTreatmentDetails'],
        message: 'পূর্বের চিকিৎসার বিবরণ প্রয়োজন',
      });
    }
  });

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
