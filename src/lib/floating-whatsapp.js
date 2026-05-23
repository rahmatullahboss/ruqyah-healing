export const DEFAULT_FLOATING_WHATSAPP = {
  enabled: true,
  label: 'WhatsApp করুন',
  number: '8801992575874',
  message: 'আসসালামু আলাইকুম, অ্যাপয়েন্টমেন্ট সম্পর্কে জানতে চাই।',
};

export function normalizeFloatingWhatsappSettings(settings = {}) {
  return {
    enabled: typeof settings.enabled === 'boolean' ? settings.enabled : DEFAULT_FLOATING_WHATSAPP.enabled,
    label: String(settings.label || DEFAULT_FLOATING_WHATSAPP.label).trim(),
    number: String(settings.number || DEFAULT_FLOATING_WHATSAPP.number).trim(),
    message: String(settings.message || DEFAULT_FLOATING_WHATSAPP.message).trim(),
  };
}
