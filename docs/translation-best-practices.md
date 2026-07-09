# Translation and i18n Best Practices

## Current approach

- Bengali remains the default/source locale at the root URLs.
- English pages live under `/en`, matching Astro's localized folder routing pattern.
- English blog content is maintained in `src/data/en-content.ts` as manual translations mapped by post slug.
- English pages should not use shortened summaries when a full Bengali post exists. The English entry should preserve the same structure: title, excerpt, headings, paragraphs, lists, and notes.

## Rules for adding or editing posts

1. Write or edit the Bengali post first.
2. Add the matching English entry in `src/data/en-content.ts` using the same slug.
3. Translate manually, preserving meaning and paragraph/heading structure.
4. Keep Islamic/ruqyah terms transliterated where needed, for example: ruqyah, sihr, qarin, khadim, marbut, waswasah, hasad.
5. Do not replace full article content with a short English summary.
6. If an English translation is missing, the page may fall back to the original post content, so missing translations should be treated as incomplete content work.

## SEO rules

- English page title, description, article section, and JSON-LD should use English metadata.
- Bengali and English versions should point to each other using alternate/hreflang links.
- The document `lang` attribute should match the current page language.
- Keep canonical URLs locale-specific: Bengali canonical for Bengali pages, English canonical for `/en` pages.

## Future improvement

For a larger content workflow, move translations into database fields or a separate translations table, for example:

- `posts.title_en`
- `posts.excerpt_en`
- `posts.content_html_en`

or a normalized table:

- `post_translations(post_id, locale, title, excerpt, content_html, status, reviewed_at)`

That will allow the admin panel to manage Bengali and English content side by side without editing code files.
