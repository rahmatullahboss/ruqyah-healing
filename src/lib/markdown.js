import { marked } from 'marked';

/**
 * Lightweight HTML sanitizer for Cloudflare Workers environment.
 * Strips dangerous tags and attributes while preserving safe markdown HTML.
 */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'div', 'span', 'sup', 'sub',
]);

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'class', 'id',
  'target', 'rel', 'width', 'height',
]);

function sanitizeHtml(html) {
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

export function renderMarkdown(content) {
  if (!content) return '';
  return marked.parse(content);
}

export function calculateReadingTime(content) {
  if (!content) return 1;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 150)); // ~150 words/min for Bengali
}
