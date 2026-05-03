import { marked } from 'marked';

/**
 * Lightweight HTML sanitizer for Cloudflare Workers environment.
 * Strips dangerous tags and attributes while preserving safe HTML.
 * Used for BOTH Markdown post-processing AND TipTap HTML output.
 *
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHtml(html) {
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (on*)
  html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Remove javascript: and data: URLs from href/src attributes
  html = html.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');
  html = html.replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '$1=""');

  // Remove style tags and their content
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove iframe, object, embed, form, input, textarea
  html = html.replace(/<\/?(?:iframe|object|embed|form|input|textarea|button|select|option)\b[^>]*>/gi, '');

  // Remove style attributes (can be used for CSS-based attacks)
  html = html.replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Add rel="noopener noreferrer" and target="_blank" to external links
  html = html.replace(/<a\s+([^>]*href\s*=\s*"https?:\/\/[^"]*"[^>]*)>/gi, (match, attrs) => {
    if (!attrs.includes('rel=')) {
      attrs += ' rel="noopener noreferrer"';
    }
    if (!attrs.includes('target=')) {
      attrs += ' target="_blank"';
    }
    return `<a ${attrs}>`;
  });

  return html;
}

/**
 * Strips all HTML tags and returns plain text, suitable for word count
 * and reading-time calculation when the post uses TipTap HTML storage.
 *
 * @param {string} html
 * @returns {string}
 */
export function extractTextFromHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')   // replace tags with spaces
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

marked.setOptions({
  gfm: true,
  breaks: true,
});

marked.use({
  hooks: {
    postprocess(html) {
      return sanitizeHtml(html);
    },
  },
});

/**
 * Render Markdown string to sanitized HTML.
 *
 * @param {string} content - Raw Markdown text
 * @returns {string} Safe HTML
 */
export function renderMarkdown(content) {
  if (!content) return '';
  return marked.parse(content);
}

/**
 * Estimate reading time in minutes.
 * Works for both plain Markdown text and extracted HTML text.
 * ~150 words/min is a comfortable pace for Bengali readers.
 *
 * @param {string} text - Plain text (not HTML, not Markdown)
 * @returns {number} Estimated minutes (minimum 1)
 */
export function calculateReadingTime(text) {
  if (!text) return 1;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 150));
}
