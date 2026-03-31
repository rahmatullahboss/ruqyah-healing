export const clinicNumbers = [
  {
    label: 'প্রধান যোগাযোগ',
    display: '01992575874',
    international: '8801992575874',
  },
  {
    label: 'সাপোর্ট',
    display: '01336202150',
    international: '8801336202150',
  },
  {
    label: 'সাপোর্ট',
    display: '01336202151',
    international: '8801336202151',
  },
];

export const primaryContact = clinicNumbers[0];

export const clinicSchedule = {
  days: 'শুক্রবার থেকে শুক্রবার',
  hours: 'সকাল ৯টা থেকে সন্ধ্যা ৬টা',
};

export const pricingHighlights = [
  {
    title: 'রুকইয়াহ ডায়াগনোসিস',
    price: '৩,৫০০ টাকা',
    details: 'প্রতি ব্যক্তি, প্রায় ১ ঘণ্টা',
  },
  {
    title: 'হোম সার্ভিস ডায়াগনোসিস',
    price: '৪,০০০ টাকা',
    details: 'প্রতি ব্যক্তি, অতিরিক্ত চার্জ প্রযোজ্য',
  },
  {
    title: 'লং / চেম্বার সেশন',
    price: '৬,০০০ টাকা',
    details: '২-৩ ঘণ্টা, জনপ্রতি',
  },
  {
    title: 'বুকিং ফি',
    price: '৫০০ টাকা',
    details: 'অগ্রিম, ফেরতযোগ্য নয়',
  },
];

export const specialOffers = [
  'নিয়মিত ক্লায়েন্টদের জন্য বিশেষ ডিসকাউন্ট।',
  'একাধিক সেবা একসাথে নিলে কম্বো অফার সুবিধা।',
  'নির্দিষ্ট সময়ে গ্রুপ সেশন বুকিংয়ে অতিরিক্ত ছাড়।',
];

export const serviceModes = [
  'চেম্বার সেবা',
  'হোম সার্ভিস সেবা',
  'অনলাইন সেবা',
];

export const sessionFormats = [
  'কনসাল্টেশন',
  'ডায়াগনোসিস',
  'সেশন',
];

export const treatmentCatalog = [
  {
    value: 'ruqyah',
    label: 'রুকইয়াহ',
    summary: 'কুরআন, সুন্নাহ ও জায়েজ দুআর আলোকে supportive care.',
    options: [
      'Counseling Session - কাউন্সেলিং সেশন',
      'Diagnosis Session - ডায়াগনোসিস সেশন',
      'Long Diagnosis Session - লং ডায়াগনোসিস সেশন',
      'Short Session - শর্ট সেশন',
      'Long Session - লং সেশন',
    ],
  },
  {
    value: 'hijama',
    label: 'হিজামা',
    summary: 'সুন্নাহসম্মত কাপিং থেরাপি ও সংশ্লিষ্ট সেবা।',
    options: [
      'Counseling Session - কাউন্সেলিং সেশন',
      'Dry Cupping',
      'Wet Cupping',
      'Bamboo Cupping',
      'Fire Cupping',
      'Massage Cupping',
      'Wet + Dry Combination',
      'Silicone / Plastic Cupping',
    ],
  },
  {
    value: 'acupuncture',
    label: 'আকুপাংচার',
    summary: 'ব্যথা, টেনশন ও দীর্ঘমেয়াদি শারীরিক সমস্যার সহায়ক চিকিৎসা।',
    options: [
      'Traditional Acupuncture - সাধারণ সূঁচ দিয়ে নির্দিষ্ট পয়েন্টে চিকিৎসা',
      'Electroacupuncture - সূঁচের সাথে হালকা বিদ্যুৎ প্রয়োগ',
      'Dry Needling - মাংসপেশির ট্রিগার পয়েন্টে সূঁচ',
      'Auricular Acupuncture - কানের পয়েন্টে চিকিৎসা',
      'Scalp Acupuncture - মাথার ত্বকে প্রয়োগ',
      'Laser Acupuncture - সূঁচের বদলে লেজার',
      'Fire Needle - গরম সূঁচ ব্যবহার',
      'Moxibustion - ভেষজ তাপ দিয়ে চিকিৎসা',
    ],
  },
  {
    value: 'acupressure',
    label: 'আকুপ্রেসার',
    summary: 'প্রেশার-পয়েন্টভিত্তিক প্রাকৃতিক থেরাপি।',
    options: [
      'Finger Pressure',
      'Palm Pressure',
      'Knuckle Pressure',
      'Elbow Pressure',
      'Tool-Assisted Pressure',
      'Foot / Hand Reflexology',
    ],
  },
  {
    value: 'massage',
    label: 'ম্যাসাজ',
    summary: 'রিল্যাক্সেশন, পেশির টান ও থেরাপিউটিক সাপোর্ট।',
    options: [
      'Swedish Massage',
      'Deep Tissue Massage',
      'Sports Massage',
      'Trigger Point Massage',
      'Shiatsu Massage',
      'Thai Massage',
      'Aromatherapy Massage',
      'Reflexology Massage',
      'Hot Stone Massage',
      'Prenatal Massage',
    ],
  },
  {
    value: 'naturopathy',
    label: 'ন্যাচারোপ্যাথি',
    summary: 'প্রাকৃতিক lifestyle guidance ও supportive wellness consultation.',
    options: [
      'ব্যক্তিগত কনসাল্টেশন',
      'রুটিন ও জীবনযাপন নির্দেশনা',
      'প্রয়োজন অনুযায়ী কাস্টম সেবা নির্বাচন',
    ],
  },
];

export const genderOptions = ['পুরুষ', 'মহিলা', 'শিশু'];
export const religionOptions = ['মুসলিম', 'হিন্দু', 'খ্রিস্টান', 'অন্যান্য'];

export const durationOptions = [
  '৬ মাস',
  '১০ মাস',
  '১ বছর',
  '২ বছর',
  '৩ বছর',
  '৫ বছর',
  '১০ বছর',
  'বালেগ হওয়ার পর থেকে',
  'শৈশব থেকেই',
  'দীর্ঘ ২০+ বছর',
  'দীর্ঘ ৩০+ বছর',
];

export const beforeYouBookChecklist = [
  'সম্পূর্ণ শিরকমুক্ত, বিদআত-মুক্ত পদ্ধতি অনুসরণ করা হয়।',
  'তাওহীদের উপর পূর্ণ নির্ভরতা রাখা জরুরি।',
  'মহিলা রোগীর জন্য মাহরাম উপস্থিতি বাধ্যতামূলক।',
  'পৃথক সেশন, পূর্ণ পর্দা ও সম্মান বজায় রাখা হয়।',
  'কোনো 100% cure guarantee দেওয়া হয় না; চূড়ান্ত শিফা আল্লাহর পক্ষ থেকেই আসে।',
  'প্রত্যেক রোগীর কেস পেশাদারিত্ব ও সম্মানের সাথে হ্যান্ডেল করা হয়।',
  'অজু অবস্থায়, নামাজ পড়ে, পরিষ্কার পোশাকে এবং পুরুষদের ক্ষেত্রে সুগন্ধি ব্যবহার করে আসুন।',
  'প্রয়োজন অনুযায়ী দুআ, আমল ও রুটিনের নির্দেশনা দেওয়া হবে।',
];

export const bookingInstructions = [
  'বুকিং নিশ্চিত হওয়ার পর সময় পরিবর্তন করা সম্ভব নাও হতে পারে।',
  'নির্ধারিত সময়ের কমপক্ষে ৩০ মিনিট পূর্বে উপস্থিত থাকতে হবে।',
  'সিরিয়াল কনফার্ম না করলে বুকিং বাতিল বলে গণ্য হবে।',
  'ঢাকার বাহিরে যাতায়াত খরচ আলাদা এবং অগ্রিম পে করতে হবে।',
  'আপনার ব্যক্তিগত তথ্য গোপনীয়ভাবে সংরক্ষণ করা হবে।',
];

export const postSubmitGuidelines = [
  'বুকিং ফি পরিশোধ ও Trx ID প্রদানের মাধ্যমে আপনার সিরিয়াল প্রাথমিকভাবে সংরক্ষিত হবে।',
  'পেমেন্ট যাচাইয়ের পর প্রতিনিধি ফোন বা SMS-এর মাধ্যমে শিডিউল চূড়ান্ত করবেন।',
  'মহিলা রোগীদের ক্ষেত্রে মাহরাম ছাড়া রুকইয়াহ করা হয় না।',
  'তাবিজ, সুতা বা শিরকি বস্তু থাকলে সেশন পূর্বে খুলে ফেলতে হবে।',
  'শারীরিক, মানসিক বা সাইকিয়াট্রিক চিকিৎসা চলমান থাকলে প্রেসক্রিপশন বা রিপোর্ট সাথে আনুন।',
  'নির্ধারিত সময়ে উপস্থিত না হলে সেশন বাতিল বলে গণ্য হবে এবং বিলম্বে সময়সীমা কমে যেতে পারে।',
  'কমপক্ষে ২৪ ঘণ্টা আগে জানালে সময় পরিবর্তনের সুযোগ থাকতে পারে, কর্তৃপক্ষের বিবেচনায়।',
  'বুকিং নিশ্চিত করার জন্য প্রদত্ত অর্থ ফেরতযোগ্য নয়।',
  'রুকইয়াহ চলাকালীন রাকী বা কর্তৃপক্ষের সকল নির্দেশনা মেনে চলা বাধ্যতামূলক।',
  'অনিবার্য কারণবশত কর্তৃপক্ষ প্রয়োজনে অ্যাপয়েন্টমেন্ট পরিবর্তন বা বাতিল করার অধিকার সংরক্ষণ করে।',
];

export const paymentMethods = ['ব্যাংক', 'বিকাশ', 'নগদ (পার্সোনাল)'];

export const paymentDetails = {
  bookingFee: '৫০০ টাকা (অগ্রিম)',
  accountPhone: '01992-575874',
  bankName: 'Islami Bank',
  branch: 'Jatrabari, Dhaka',
  accountName: 'Md Omor Hasan Sheikh',
  accountNumber: '20502047800010917',
};

export function getWhatsappUrl(message = '', number = primaryContact.international) {
  const base = `https://wa.me/${number}`;

  if (!message) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}

function joinSelected(items) {
  if (Array.isArray(items)) {
    return items.filter(Boolean).join(', ');
  }

  return items || 'প্রযোজ্য নয়';
}

export function buildAppointmentWhatsappMessage(values) {
  const lines = [
    'আসসালামু আলাইকুম, আমি অ্যাপয়েন্টমেন্ট বুক করতে চাই।',
    '',
    '👤 রুগীর ব্যক্তিগত তথ্য',
    `নাম: ${values.fullName || 'উল্লেখ করা হয়নি'}`,
    `ভোটার আইডি: ${values.nid || 'উল্লেখ করা হয়নি'}`,
    `বয়স: ${values.age || 'উল্লেখ করা হয়নি'}`,
    `ওজন: ${values.weight || 'উল্লেখ করা হয়নি'}`,
    `লিঙ্গ: ${values.gender || 'উল্লেখ করা হয়নি'}`,
    `রিলিজিয়ন: ${values.religion || 'উল্লেখ করা হয়নি'}`,
    `সমস্যার স্থায়িত্ব: ${values.duration || 'উল্লেখ করা হয়নি'}`,
    '',
    '🗓️ শিডিউল ও সেবার ধরণ',
    `সেবা নেওয়ার মাধ্যম: ${values.serviceMode || 'উল্লেখ করা হয়নি'}`,
    `সেশন ধরন: ${values.sessionFormat || 'উল্লেখ করা হয়নি'}`,
    `চিকিৎসার ধরন: ${values.treatmentType || 'উল্লেখ করা হয়নি'}`,
    `নির্বাচিত সাব-অপশন: ${joinSelected(values.subServices)}`,
    `পছন্দের তারিখ: ${values.preferredDate || 'উল্লেখ করা হয়নি'}`,
    `পছন্দের সময়: ${values.preferredTime || 'উল্লেখ করা হয়নি'}`,
    '',
    '📍 যোগাযোগ',
    `ঠিকানা: ${values.address || 'উল্লেখ করা হয়নি'}`,
    `মোবাইল: ${values.phone || 'উল্লেখ করা হয়নি'}`,
    `হোয়াটসঅ্যাপ: ${values.whatsapp || values.phone || 'উল্লেখ করা হয়নি'}`,
    '',
    '🩺 বর্তমান অবস্থা',
    `প্রধান সমস্যা: ${values.problem || 'উল্লেখ করা হয়নি'}`,
    `পূর্বে চিকিৎসা / রুকইয়াহ: ${values.previousTreatment || 'উল্লেখ করা হয়নি'}`,
  ];

  if (values.previousTreatment === 'হ্যাঁ') {
    lines.push(`পূর্বের চিকিৎসার বিবরণ: ${values.previousTreatmentDetails || 'উল্লেখ করা হয়নি'}`);
  }

  lines.push(
    '',
    '💳 পেমেন্ট',
    `পেমেন্ট মাধ্যম: ${values.paymentMethod || 'উল্লেখ করা হয়নি'}`,
    `Trx ID: ${values.transactionId || 'উল্লেখ করা হয়নি'}`,
    `টাকা পাঠানোর সময়: ${values.paymentTimestamp || 'উল্লেখ করা হয়নি'}`,
    '',
    'নোট: উপরোক্ত শর্তসমূহের সাথে সম্মতি দিয়ে বুকিং পাঠানো হলো।'
  );

  return lines.join('\n');
}
