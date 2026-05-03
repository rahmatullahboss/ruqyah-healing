import { DEFAULT_CLINIC_CONTACTS, normalizeClinicContacts } from './clinic-contacts.js';
import { DEFAULT_FLOATING_WHATSAPP, normalizeFloatingWhatsappSettings } from './floating-whatsapp.js';

export const DEFAULT_CLINIC_SCHEDULE = {
  days: 'শনিবার থেকে বৃহস্পতিবার',
  hours: 'সকাল ৯টা থেকে সন্ধ্যা ৬টা',
};

export const DEFAULT_PAYMENT_DETAILS = {
  bookingFee: '৫০০ টাকা (অগ্রিম)',
  accountPhone: '01992-575874',
  bankName: 'Islami Bank',
  branch: 'Jatrabari, Dhaka',
  accountName: 'Md Omor Hasan Sheikh',
  accountNumber: '20502047800010917',
};

export const DEFAULT_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/Ruqyahhealingg',
  youtube: '',
};

export function buildPublicSiteSettings(settings = {}) {
  return {
    clinicPhones: normalizeClinicContacts(settings.clinic_phones, DEFAULT_CLINIC_CONTACTS),
    clinicSchedule: {
      days: String(settings.clinic_schedule?.days || DEFAULT_CLINIC_SCHEDULE.days).trim(),
      hours: String(settings.clinic_schedule?.hours || DEFAULT_CLINIC_SCHEDULE.hours).trim(),
    },
    paymentDetails: {
      bookingFee: String(settings.payment_details?.bookingFee || DEFAULT_PAYMENT_DETAILS.bookingFee).trim(),
      accountPhone: String(settings.payment_details?.accountPhone || DEFAULT_PAYMENT_DETAILS.accountPhone).trim(),
      bankName: String(settings.payment_details?.bankName || DEFAULT_PAYMENT_DETAILS.bankName).trim(),
      branch: String(settings.payment_details?.branch || DEFAULT_PAYMENT_DETAILS.branch).trim(),
      accountName: String(settings.payment_details?.accountName || DEFAULT_PAYMENT_DETAILS.accountName).trim(),
      accountNumber: String(settings.payment_details?.accountNumber || DEFAULT_PAYMENT_DETAILS.accountNumber).trim(),
    },
    socialLinks: {
      facebook: String(settings.social_links?.facebook || DEFAULT_SOCIAL_LINKS.facebook).trim(),
      youtube: String(settings.social_links?.youtube || DEFAULT_SOCIAL_LINKS.youtube).trim(),
    },
    floatingWhatsapp: normalizeFloatingWhatsappSettings(settings.floating_whatsapp || DEFAULT_FLOATING_WHATSAPP),
  };
}
