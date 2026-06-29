import test from 'node:test';
import assert from 'node:assert/strict';
import { json, validateQuizQuestions } from '../src/lib/api-helpers.js';

// --- json() ---

test('json returns Response with correct status and body', async () => {
  const res = json({ ok: true }, 200);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'application/json');
  const body = await res.json();
  assert.deepEqual(body, { ok: true });
});

test('json defaults to status 200', () => {
  const res = json({ test: 1 });
  assert.equal(res.status, 200);
});

test('json supports custom status codes', async () => {
  const res = json({ error: 'bad' }, 400);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'bad');
});

// --- validateQuizQuestions ---

test('validateQuizQuestions returns null for valid questions', () => {
  const result = validateQuizQuestions([
    {
      questionText: 'What is 2+2?',
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
      ],
    },
  ]);
  assert.equal(result, null);
});

test('validateQuizQuestions returns null for empty array', () => {
  assert.equal(validateQuizQuestions([]), null);
});

test('validateQuizQuestions rejects missing questionText', () => {
  const result = validateQuizQuestions([
    { options: [{ text: 'A', isCorrect: true }] },
  ]);
  assert.match(result, /questionText/);
});

test('validateQuizQuestions rejects empty questionText', () => {
  const result = validateQuizQuestions([
    { questionText: '   ', options: [{ text: 'A', isCorrect: true }] },
  ]);
  assert.match(result, /questionText/);
});

test('validateQuizQuestions rejects non-string questionText', () => {
  const result = validateQuizQuestions([
    { questionText: 123, options: [{ text: 'A', isCorrect: true }] },
  ]);
  assert.match(result, /questionText/);
});

test('validateQuizQuestions rejects empty options array', () => {
  const result = validateQuizQuestions([
    { questionText: 'Q?', options: [] },
  ]);
  assert.match(result, /options/);
});

test('validateQuizQuestions rejects missing options', () => {
  const result = validateQuizQuestions([
    { questionText: 'Q?' },
  ]);
  assert.match(result, /options/);
});

test('validateQuizQuestions rejects option without text', () => {
  const result = validateQuizQuestions([
    {
      questionText: 'Q?',
      options: [{ isCorrect: true }],
    },
  ]);
  assert.match(result, /text field/);
});

test('validateQuizQuestions rejects option without isCorrect boolean', () => {
  const result = validateQuizQuestions([
    {
      questionText: 'Q?',
      options: [{ text: 'A', isCorrect: 'yes' }],
    },
  ]);
  assert.match(result, /isCorrect/);
});

test('validateQuizQuestions rejects question with no correct option', () => {
  const result = validateQuizQuestions([
    {
      questionText: 'Q?',
      options: [
        { text: 'A', isCorrect: false },
        { text: 'B', isCorrect: false },
      ],
    },
  ]);
  assert.match(result, /at least one correct/);
});

test('validateQuizQuestions validates multiple questions', () => {
  const result = validateQuizQuestions([
    {
      questionText: 'Q1?',
      options: [{ text: 'A', isCorrect: true }],
    },
    {
      questionText: 'Q2?',
      options: [{ text: 'B', isCorrect: false }], // no correct option
    },
  ]);
  assert.match(result, /at least one correct/);
});

test('validateQuizQuestions passes with multiple valid questions', () => {
  const result = validateQuizQuestions([
    {
      questionText: 'Q1?',
      options: [
        { text: 'A', isCorrect: true },
        { text: 'B', isCorrect: false },
      ],
    },
    {
      questionText: 'Q2?',
      options: [
        { text: 'C', isCorrect: false },
        { text: 'D', isCorrect: true },
      ],
    },
  ]);
  assert.equal(result, null);
});
