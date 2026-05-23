import type { TestCategory } from './test-data';

type CategoryMeta = {
  title: string;
  subtitle: string;
  description: string;
};

const CATEGORY_META_EN: Record<string, CategoryMeta> = {
  physical: {
    title: 'Physical Condition Assessment',
    subtitle: 'Body-focused symptoms',
    description: 'Evaluate persistent physical complaints and patterns before advanced ruqyah steps.',
  },
  evilEye: {
    title: 'Evil Eye Assessment',
    subtitle: 'Hasad and nazar indicators',
    description: 'Check signs commonly linked with envy-based harm and recurring setbacks.',
  },
  blackMagic: {
    title: 'Sihr (Black Magic) Assessment',
    subtitle: 'Magic-related indicators',
    description: 'Review warning signals often associated with sihr and spiritual interference.',
  },
  jinnPossession: {
    title: 'Jinn Influence Assessment',
    subtitle: 'Spiritual disturbance indicators',
    description: 'Assess patterns that may point to jinn influence and severe waswasa.',
  },
  mental: {
    title: 'Mental and Emotional Assessment',
    subtitle: 'Mind and behavior patterns',
    description: 'Screen anxiety, fear, concentration, and emotional instability patterns.',
  },
  kids: {
    title: 'Children Assessment',
    subtitle: 'Child-focused checklist',
    description: 'Age-based ruqyah screening for infants and children using separate question sets.',
  },
};

export function getEnglishCategoryMeta(category: TestCategory) {
  return CATEGORY_META_EN[category.id] || {
    title: category.title,
    subtitle: category.subtitle,
    description: category.description,
  };
}
