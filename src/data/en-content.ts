const CATEGORY_LABELS = {
  'যাদু': 'Magic',
  'রুকইয়াহ': 'Ruqyah',
  'জ্বীন': 'Jinn',
} as const;

const POST_META = {
  'what-is-qarin-magic': {
    title: 'What Is Qarin Magic?',
    excerpt: 'A guide to qarin-linked sihr, why it is considered difficult, and what the treatment path usually looks like.',
    bodyHtml: `
      <h2>What qarin magic means</h2>
      <p>In ruqyah discussions, qarin magic refers to a type of sihr where the hidden influence is believed to work through a person’s qarin, or companion jinn. The idea is that the affliction becomes harder to address because the influence is not only on the person, but also on the jinn that stays close to them.</p>
      <h2>Why it is considered difficult</h2>
      <p>This is often described as complex because the patient may feel repeated setbacks, sudden regressions, and emotional pressure even after treatment sessions. The condition is usually framed as requiring consistent ruqyah, patience, and a clear treatment path instead of one-off sessions.</p>
      <h2>What to do next</h2>
      <p>If your symptoms keep returning, the best next step is to review the diagnosis with a qualified raqi and continue a disciplined ruqyah routine. For urgent physical or mental symptoms, medical care should come first.</p>
      <p><strong>Recommended next action:</strong> discuss your result with a raqi on WhatsApp or book an appointment for a deeper review.</p>
    `,
  },
  'how-jinn-stays-in-the-body': {
    title: 'How Jinn Can Remain in the Body',
    excerpt: 'An overview of common ruqyah frameworks used to explain how spiritual affliction is perceived in the body.',
    bodyHtml: `
      <h2>How the issue is usually described</h2>
      <p>In many ruqyah frameworks, jinn influence is described as entering or attaching to the body through sihr or the evil eye. Different patterns are used to explain where the jinn is affecting the person and how the symptoms show up.</p>
      <h2>Two common patterns</h2>
      <p>Some people are described as having a jinn that moves around the body and causes shifting symptoms such as anger, restlessness, or unusual behavior. Others are said to have jinn influence locked to specific areas, which can present as persistent pain, heaviness, weakness, or numbness in the same place.</p>
      <h2>Treatment angle</h2>
      <p>The general advice is to keep consistent ruqyah, observe the reaction patterns carefully, and use supportive measures such as recitation, cupping where appropriate, and a stable treatment schedule.</p>
    `,
  },
  'why-symptoms-return-after-ruqyah': {
    title: 'Why Symptoms Return After Ruqyah',
    excerpt: 'Why some people feel better temporarily and then notice symptoms coming back after treatment.',
    bodyHtml: `
      <h2>Temporary improvement is common</h2>
      <p>Some patients feel relief after ruqyah but notice that symptoms return later. In ruqyah-based explanations, that does not always mean the treatment failed. It can mean the underlying cause has not yet been fully broken.</p>
      <h2>Why the return happens</h2>
      <p>The return of symptoms is often framed as a sign that the external environment, the body, or the connected influence still needs attention. A patient may improve during sessions and then regress when they return to the same home, habits, or triggers.</p>
      <h2>What helps</h2>
      <p>Continue the routine, review your diagnosis, and remove any obstacles that keep pulling the case back. When the pattern is persistent, it is reasonable to discuss the case with a raqi rather than guessing.</p>
    `,
  },
  'why-no-reaction-during-ruqyah': {
    title: 'Why There May Be No Reaction During Ruqyah',
    excerpt: 'A practical explanation of why some cases appear silent during sessions even when symptoms are present.',
    bodyHtml: `
      <h2>No reaction does not always mean no issue</h2>
      <p>Some cases look quiet during recitation. In practice, that can happen when the affliction is not expressive, when the person is mentally guarded, or when the influence reacts more strongly at home than in a session room.</p>
      <h2>What to watch for</h2>
      <p>Instead of focusing only on visible reaction, observe what happens later: fatigue, heaviness, sleep changes, irritation, fear, or a sudden drop in energy after the session. Those delayed patterns matter.</p>
      <h2>Next step</h2>
      <p>If the symptoms are real but the session appears silent, the case may need a different treatment approach. A raqi can decide whether to continue ruqyah, adjust the method, or add supportive measures.</p>
    `,
  },
  'love-magic-and-its-consequences': {
    title: 'Love Magic and Its Consequences',
    excerpt: 'Why coercive love magic harms families, trust, and long-term stability.',
    bodyHtml: `
      <h2>What love magic tries to do</h2>
      <p>Love magic is usually described as an attempt to force attraction, control, or emotional dependency through forbidden means. In family settings, that can distort judgment and create unstable relationships instead of real affection.</p>
      <h2>Why it damages homes</h2>
      <p>When people use coercive spiritual practices, the result is often not peace but suspicion, emotional dependence, conflict, and collapse of trust. The damage can spread to children and extended family as well.</p>
      <h2>Better alternative</h2>
      <p>Real marital stability comes from honesty, responsibility, kindness, and lawful effort. If a couple is struggling, they should seek advice, ruqyah support when relevant, and practical counseling instead of secretive spiritual harm.</p>
    `,
  },
  'marbut-jinn-and-magic-servant': {
    title: 'Marbut Jinn and the Bound Servant of Magic',
    excerpt: 'How “bound” servants are described in ruqyah discourse and why treatment can take time.',
    bodyHtml: `
      <h2>What “marbut” means here</h2>
      <p>In ruqyah language, a marbut jinn is described as a servant that remains bound to the magic and keeps the influence active. Because of that binding, symptoms may return repeatedly until the underlying sihr is weakened or removed.</p>
      <h2>Why treatment can take time</h2>
      <p>A bound servant is often said to resist leaving quickly. That is why some patients need repeated sessions, consistent recitation, and a structured plan rather than expecting a single dramatic moment.</p>
      <h2>Practical direction</h2>
      <p>The focus should stay on breaking the connection, not on chasing reaction for its own sake. When the case is stubborn, discuss the pattern with a raqi and follow the plan carefully.</p>
    `,
  },
  'what-is-khadim-jinn-and-what-it-does': {
    title: 'What Is a Khadim Jinn and What Does It Do?',
    excerpt: 'A clearer explanation of the khadim concept, how it is framed, and what role it is said to play.',
    bodyHtml: `
      <h2>How the khadim concept is used</h2>
      <p>The term khadim jinn is used in some ruqyah discussions to describe a servant-like jinn that is believed to protect, maintain, or activate the effect of sihr. It is a functional description inside that treatment framework.</p>
      <h2>Why it matters</h2>
      <p>When a case is framed this way, the jinn is not treated as an isolated problem. The goal is to break the structure that keeps the influence active and to observe how the symptoms change over time.</p>
      <h2>What to remember</h2>
      <p>Do not build the plan only around labels. Focus on the symptom pattern, the return pattern, and the response to recitation. That is what helps a raqi decide the next step.</p>
    `,
  },
} as const;

type EnglishCategory = keyof typeof CATEGORY_LABELS;
type EnglishPostSlug = keyof typeof POST_META;
type EnglishPostMeta = (typeof POST_META)[EnglishPostSlug];

export function getEnglishCategoryLabel(category: string) {
  return CATEGORY_LABELS[category as EnglishCategory] || category;
}

export function getEnglishPostMeta(slug: string, fallback: Partial<EnglishPostMeta> = {}) {
  return POST_META[slug as EnglishPostSlug] || fallback;
}

export function getEnglishPostBodyHtml(slug: string) {
  return POST_META[slug as EnglishPostSlug]?.bodyHtml || '';
}
