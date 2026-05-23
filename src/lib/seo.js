import { getLocaleMeta, localeAlternates, normalizeLocale } from './i18n.js';

export function buildSiteSchemas(siteUrl, siteName, description) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      description,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/ruqyah-logo.png`,
      },
      sameAs: [
        'https://www.facebook.com/Ruqyahhealingg',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: siteName,
      description: 'ইসলামী রুকইয়াহ চিকিৎসা কেন্দ্র — কুরআন ও সুন্নাহ ভিত্তিক আধ্যাত্মিক ও শারীরিক সুস্থতার পথে আপনার বিশ্বস্ত সঙ্গী।',
      url: siteUrl,
      telephone: '+8801992575874',
      email: 'info@ruqyahhealing.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'ঢাকা',
        addressCountry: 'BD',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 23.8103,
        longitude: 90.4125,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Saturday',
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
        ],
        opens: '09:00',
        closes: '18:00',
      },
      priceRange: '৳৳',
      areaServed: {
        '@type': 'Country',
        name: 'Bangladesh',
      },
      availableLanguage: ['bn', 'en'],
      image: `${siteUrl}/images/hero-bg.webp`,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/ruqyah-logo.png`,
      },
    },
  ];
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(questions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildServiceSchema({
  siteUrl,
  pageUrl,
  name,
  description,
  areaServed = 'Bangladesh',
  availableLanguage = ['bn', 'en'],
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: pageUrl,
    provider: {
      '@type': 'Organization',
      name: 'Ruqyah Healing Center',
      url: siteUrl,
    },
    areaServed,
    availableLanguage,
  };
}

export function buildCollectionPageSchema({
  pageUrl,
  name,
  description,
  items = [],
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: pageUrl,
    hasPart: items.map((item) => ({
      '@type': item.type || 'CreativeWork',
      name: item.name,
      url: item.url,
      inLanguage: item.inLanguage,
    })),
  };
}

export function buildCreativeWorkSchema({
  pageUrl,
  name,
  description,
  fileUrl,
  inLanguage,
  category,
  pageCount,
  encodingFormat = 'application/pdf',
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    description,
    url: pageUrl,
    inLanguage,
    genre: category,
    encodingFormat,
    contentUrl: fileUrl,
    numberOfPages: pageCount,
    publisher: {
      '@type': 'Organization',
      name: 'Ruqyah Healing Center',
    },
  };
}

export function buildWebPageSchema({
  pageUrl,
  name,
  description,
  inLanguage,
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: pageUrl,
    inLanguage,
  };
}

export function buildLocalBusinessSchema({
  siteUrl,
  name,
  description,
  telephone,
  email,
  address,
  geo,
  openingHours,
  priceRange,
  areaServed,
  sameAs = [],
  image,
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url: siteUrl,
    telephone,
    email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: address?.city,
      addressCountry: address?.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geo?.latitude,
      longitude: geo?.longitude,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: openingHours?.days || ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: openingHours?.opens || '09:00',
      closes: openingHours?.closes || '18:00',
    },
    priceRange: priceRange || '৳৳',
    areaServed: {
      '@type': 'Country',
      name: areaServed || 'Bangladesh',
    },
    availableLanguage: ['bn', 'en'],
    sameAs,
    image,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/images/ruqyah-logo.png`,
    },
  };
}

export function buildHowToSchema({
  name,
  description,
  url,
  steps,
  estimatedTime,
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    url,
    estimatedTime: estimatedTime || 'PT30M',
    step: steps.map((item, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: item.name,
      text: item.text,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

export function buildVideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration: duration || 'PT1M',
    contentUrl,
    embedUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Ruqyah Healing Center',
      logo: {
        '@type': 'ImageObject',
        url: `${new URL(contentUrl || 'https://ruqyahhealing.com').origin}/images/ruqyah-logo.png`,
      },
    },
  };
}

export function buildAlternateLinks(siteUrl, pathname, locale) {
  const alternates = localeAlternates(pathname);
  const currentLocale = normalizeLocale(locale);
  const current = getLocaleMeta(currentLocale);

  return {
    canonical: `${siteUrl}${alternates[currentLocale]}`,
    alternates,
    current,
  };
}
