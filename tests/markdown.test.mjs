import test from 'node:test';
import assert from 'node:assert/strict';

import { renderMarkdown, calculateReadingTime } from '../src/lib/markdown.js';

test('renders basic markdown to HTML', () => {
  const html = renderMarkdown('**bold** and *italic*');
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
});

test('strips script tags from markdown output', () => {
  const html = renderMarkdown('<script>alert("xss")</script>Hello');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('alert'));
  assert.match(html, /Hello/);
});

test('strips event handlers from markdown output', () => {
  const html = renderMarkdown('<img src="x" onerror="alert(1)">');
  assert.ok(!html.includes('onerror'));
  assert.ok(!html.includes('alert'));
});

test('strips javascript: URLs from markdown output', () => {
  const html = renderMarkdown('<a href="javascript:alert(1)">click</a>');
  assert.ok(!html.includes('javascript:'));
});

test('strips style tags from markdown output', () => {
  const html = renderMarkdown('<style>body{display:none}</style>Hello');
  assert.ok(!html.includes('<style>'));
  assert.ok(!html.includes('display:none'));
});

test('strips iframe tags from markdown output', () => {
  const html = renderMarkdown('<iframe src="https://evil.com"></iframe>');
  assert.ok(!html.includes('<iframe'));
});

test('strips style attributes from markdown output', () => {
  const html = renderMarkdown('<div style="background:url(evil)">content</div>');
  assert.ok(!html.includes('style='));
});

test('adds rel="noopener noreferrer" to external links', () => {
  const html = renderMarkdown('[link](https://example.com)');
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /target="_blank"/);
});

test('returns empty string for null/undefined content', () => {
  assert.equal(renderMarkdown(null), '');
  assert.equal(renderMarkdown(undefined), '');
  assert.equal(renderMarkdown(''), '');
});

test('calculateReadingTime returns at least 1 minute', () => {
  assert.equal(calculateReadingTime('short'), 1);
  assert.equal(calculateReadingTime(null), 1);
});

test('calculateReadingTime calculates based on 150 wpm', () => {
  const words = Array(300).fill('word').join(' ');
  assert.equal(calculateReadingTime(words), 2);
});
