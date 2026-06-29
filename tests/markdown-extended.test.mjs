import test from 'node:test';
import assert from 'node:assert/strict';
import { extractTextFromHtml, sanitizeHtml } from '../src/lib/markdown.js';

// --- extractTextFromHtml ---

test('extractTextFromHtml strips HTML tags', () => {
  assert.equal(extractTextFromHtml('<p>Hello</p>'), 'Hello');
  assert.equal(extractTextFromHtml('<h1>Title</h1><p>Body</p>'), 'Title Body');
});

test('extractTextFromHtml decodes HTML entities', () => {
  assert.equal(extractTextFromHtml('a&nbsp;b'), 'a b');
  assert.equal(extractTextFromHtml('a&amp;b'), 'a&b');
  assert.equal(extractTextFromHtml('&lt;div&gt;'), '<div>');
  assert.equal(extractTextFromHtml('&quot;hello&quot;'), '"hello"');
  assert.equal(extractTextFromHtml('&#39;hello&#39;'), "'hello'");
});

test('extractTextFromHtml collapses whitespace', () => {
  assert.equal(extractTextFromHtml('<p>Hello</p>  <p>World</p>'), 'Hello World');
  assert.equal(extractTextFromHtml('  <p>  Hello  </p>  '), 'Hello');
});

test('extractTextFromHtml handles nested tags', () => {
  assert.equal(
    extractTextFromHtml('<div><p><strong>Bold</strong> and <em>italic</em></p></div>'),
    'Bold and italic'
  );
});

test('extractTextFromHtml returns empty string for falsy input', () => {
  assert.equal(extractTextFromHtml(''), '');
  assert.equal(extractTextFromHtml(null), '');
  assert.equal(extractTextFromHtml(undefined), '');
});

test('extractTextFromHtml handles self-closing tags', () => {
  assert.equal(extractTextFromHtml('Line 1<br/>Line 2'), 'Line 1 Line 2');
  assert.equal(extractTextFromHtml('Text<hr/>More'), 'Text More');
});

test('extractTextFromHtml handles complex real-world HTML', () => {
  const html = `
    <h2>রুকইয়াহ কি?</h2>
    <p>রুকইয়াহ হলো <strong>কুরআনের আয়াত</strong> পাঠ করার মাধ্যমে চিকিৎসা।</p>
    <ul><li>পয়েন্ট ১</li><li>পয়েন্ট ২</li></ul>
  `;
  const text = extractTextFromHtml(html);
  assert.ok(text.includes('রুকইয়াহ কি?'));
  assert.ok(text.includes('কুরআনের আয়াত'));
  assert.ok(text.includes('পয়েন্ট ১'));
  assert.ok(!text.includes('<'));
});

// --- sanitizeHtml ---

test('sanitizeHtml strips script tags', () => {
  const result = sanitizeHtml('<p>Safe</p><script>alert("xss")</script>');
  assert.ok(!result.includes('<script>'));
  assert.ok(!result.includes('alert'));
  assert.ok(result.includes('Safe'));
});

test('sanitizeHtml strips event handlers', () => {
  const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
  assert.ok(!result.includes('onerror'));
});

test('sanitizeHtml strips javascript: URLs', () => {
  const result = sanitizeHtml('<a href="javascript:alert(1)">Link</a>');
  assert.ok(!result.includes('javascript:'));
});

test('sanitizeHtml strips style tags', () => {
  const result = sanitizeHtml('<p>Text</p><style>body{color:red}</style>');
  assert.ok(!result.includes('<style>'));
  assert.ok(result.includes('Text'));
});

test('sanitizeHtml strips iframe, form, input tags', () => {
  const result = sanitizeHtml('<iframe src="evil"></iframe><form><input type="text"></form>');
  assert.ok(!result.includes('<iframe'));
  assert.ok(!result.includes('<form'));
  assert.ok(!result.includes('<input'));
});

test('sanitizeHtml strips style attributes', () => {
  const result = sanitizeHtml('<p style="color:red">Text</p>');
  assert.ok(!result.includes('style='));
  assert.ok(result.includes('Text'));
});

test('sanitizeHtml adds rel and target to external links', () => {
  const result = sanitizeHtml('<a href="https://example.com">Link</a>');
  assert.ok(result.includes('rel="noopener noreferrer"'));
  assert.ok(result.includes('target="_blank"'));
});

test('sanitizeHtml preserves safe HTML', () => {
  const result = sanitizeHtml('<p>Hello <strong>world</strong></p>');
  assert.ok(result.includes('<p>'));
  assert.ok(result.includes('<strong>'));
  assert.ok(result.includes('Hello'));
  assert.ok(result.includes('world'));
});
