import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateNeuronsFromUsage,
  createOpenAiCompatibleSseResponse,
  createSseResponseFromText,
  estimateRequestNeurons,
  handleChatRequest,
  isWorkersAiFreeLimitError,
} from '../src/lib/ai/chat.js';

test('converts Workers AI text output into OpenAI-style SSE chunks', async () => {
  const response = createSseResponseFromText('আসসালামু আলাইকুম');
  const body = await response.text();

  assert.equal(response.headers.get('Content-Type'), 'text/event-stream');
  assert.match(body, /"choices":\[\{"delta":\{"content":"আসসালামু আলাইকুম"\}\}\]/);
  assert.match(body, /\[DONE\]/);
});

test('converts cumulative Workers AI SSE chunks into incremental OpenAI deltas', async () => {
  const encoder = new TextEncoder();
  const upstream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"response":"সম্ভাব্য"}\n\n'));
      controller.enqueue(encoder.encode('data: {"response":"সম্ভাব্য দিক"}\n\n'));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  const response = createOpenAiCompatibleSseResponse(upstream);
  const body = await response.text();

  assert.match(body, /"content":"সম্ভাব্য"/);
  assert.match(body, /"content":" দিক"/);
  assert.match(body, /\[DONE\]/);
});

test('preserves leading spaces from streamed text chunks', async () => {
  const encoder = new TextEncoder();
  const upstream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"response":"আলহামদুলিল্লাহ"}\n\n'));
      controller.enqueue(encoder.encode('data: {"response":"আলহামদুলিল্লাহ, ভালো আছি"}\n\n'));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  const response = createOpenAiCompatibleSseResponse(upstream);
  const body = await response.text();

  assert.match(body, /"content":"আলহামদুলিল্লাহ"/);
  assert.match(body, /"content":", ভালো আছি"/);
});

test('converts OpenAI-compatible delta streams into SSE chunks', async () => {
  const encoder = new TextEncoder();
  const upstream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'));
      controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":" world"}}]}\n\n'));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  const response = createOpenAiCompatibleSseResponse(upstream);
  const body = await response.text();

  assert.match(body, /"content":"Hello"/);
  assert.match(body, /"content":" world"/);
  assert.match(body, /\[DONE\]/);
});

test('detects Workers AI free allocation errors', () => {
  const error = {
    status: 429,
    message: 'You have used up your daily free allocation of 10,000 neurons.',
    code: 3036,
  };

  assert.equal(isWorkersAiFreeLimitError(error), true);
});

test('estimates neurons conservatively for a request', () => {
  const neurons = estimateRequestNeurons('@cf/google/gemma-3-12b-it', 'user: amar matha betha', 450);

  assert.equal(Number.isInteger(neurons), true);
  assert.equal(neurons > 0, true);
});

test('uses official usage counters when available', () => {
  const neurons = calculateNeuronsFromUsage(
    '@cf/google/gemma-3-12b-it',
    { prompt_tokens: 1000, completion_tokens: 500 },
    '',
    '',
  );

  assert.equal(neurons, 57);
});

test('uses configured Ollama fallback even when Workers AI binding is unavailable', async () => {
  const originalFetch = global.fetch;
  const encoder = new TextEncoder();

  global.fetch = async (url) => {
    assert.equal(url, 'https://example.com/v1/chat/completions');
    return new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"response":"Fallback works"}\n\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    const request = new Request('https://example.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    });

    const response = await handleChatRequest(request, {
      OLLAMA_BASE_URL: 'https://example.com/v1',
      OLLAMA_MODEL: 'llama3',
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'text/event-stream');
    const body = await response.text();
    assert.match(body, /Fallback works/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('does not attempt localhost Ollama fallback when it is not explicitly configured', async () => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;

  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('should not be called');
  };

  try {
    const request = new Request('https://example.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    });

    const response = await handleChatRequest(request, {
      AI: {
        run: async () => {
          throw { status: 429, code: 3036, message: 'daily free allocation of 10,000 neurons' };
        },
      },
    });

    assert.equal(fetchCalls, 0);
    assert.equal(response.status, 503);
  } finally {
    global.fetch = originalFetch;
  }
});
