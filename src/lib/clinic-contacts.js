export const CONTACT_TYPES = ['call', 'whatsapp', 'both'];

export const DEFAULT_CLINIC_CONTACTS = [
  {
    label: 'প্রধান যোগাযোগ',
    display: '01992575874',
    international: '8801992575874',
    type: 'both',
  },
  {
    label: 'সাপোর্ট',
    display: '01336202150',
    international: '8801336202150',
    type: 'call',
  },
  {
    label: 'WhatsApp সাপোর্ট',
    display: '01336202151',
    international: '8801336202151',
    type: 'whatsapp',
  },
];

function normalizeContactType(type) {
  const normalizedType = String(type || '').trim().toLowerCase();
  return CONTACT_TYPES.includes(normalizedType) ? normalizedType : 'both';
}

export function normalizeClinicContact(contact = {}, fallback = {}) {
  return {
    label: String(contact.label ?? fallback.label ?? '').trim(),
    display: String(contact.display ?? fallback.display ?? '').trim(),
    international: String(contact.international ?? fallback.international ?? '').trim(),
    type: normalizeContactType(contact.type ?? fallback.type),
  };
}

export function normalizeClinicContacts(contacts, fallbackContacts = DEFAULT_CLINIC_CONTACTS) {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return fallbackContacts.map((contact) => normalizeClinicContact(contact));
  }

  return contacts
    .map((contact, index) => normalizeClinicContact(contact, fallbackContacts[index] || fallbackContacts[0] || {}))
    .filter((contact) => contact.display);
}

export function contactSupportsCall(contact) {
  return contact?.type === 'call' || contact?.type === 'both';
}

export function contactSupportsWhatsapp(contact) {
  return contact?.type === 'whatsapp' || contact?.type === 'both';
}

export function getPrimaryCallContact(contacts) {
  return contacts.find(contactSupportsCall) || contacts[0] || null;
}

export function getPrimaryWhatsappContact(contacts) {
  return contacts.find(contactSupportsWhatsapp) || contacts[0] || null;
}
