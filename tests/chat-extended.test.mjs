import test from 'node:test';
import assert from 'node:assert/strict';

// Chat/AI lib tests — exported helper functions from chat.js.

test('chat: createSseResponseFromText creates valid SSE', async () => {
  const { createSseResponseFromText } = await import('../src/lib/ai/chat.js');
  const response = createSseResponseFromText('Hello world');
  assert.equal(response.headers.get('Content-Type'), 'text/event-stream');
  const text = await new Response(response.body).text();
  assert.ok(text.includes('data:'));
  assert.ok(text.includes('[DONE]'));
});

test('chat: createOpenAiCompatibleSseResponse creates valid SSE', async () => {
  const { createOpenAiCompatibleSseResponse } = await import('../src/lib/ai/chat.js');
  const chunks = ['Hello', ' ', 'world'];
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`));
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  const response = createOpenAiCompatibleSseResponse(stream);
  assert.equal(response.headers.get('Content-Type'), 'text/event-stream');
});

test('chat: isWorkersAiFreeLimitError detects status 429', async () => {
  const { isWorkersAiFreeLimitError } = await import('../src/lib/ai/chat.js');
  assert.equal(isWorkersAiFreeLimitError({ status: 429 }), true);
});

test('chat: isWorkersAiFreeLimitError detects code 3036', async () => {
  const { isWorkersAiFreeLimitError } = await import('../src/lib/ai/chat.js');
  assert.equal(isWorkersAiFreeLimitError({ code: 3036 }), true);
});

test('chat: isWorkersAiFreeLimitError detects neurons message', async () => {
  const { isWorkersAiFreeLimitError } = await import('../src/lib/ai/chat.js');
  assert.equal(isWorkersAiFreeLimitError(new Error('10,000 neurons limit reached')), true);
  assert.equal(isWorkersAiFreeLimitError(new Error('daily free allocation exceeded')), true);
  assert.equal(isWorkersAiFreeLimitError(new Error('neurons quota exceeded')), true);
});

test('chat: isWorkersAiFreeLimitError rejects non-matching errors', async () => {
  const { isWorkersAiFreeLimitError } = await import('../src/lib/ai/chat.js');
  assert.equal(isWorkersAiFreeLimitError(new Error('rate limit')), false);
  assert.equal(isWorkersAiFreeLimitError(new Error('some other error')), false);
  assert.equal(isWorkersAiFreeLimitError(null), false);
  assert.equal(isWorkersAiFreeLimitError(undefined), false);
  assert.equal(isWorkersAiFreeLimitError('string'), false);
});

test('chat: estimateRequestNeurons returns positive number', async () => {
  const { estimateRequestNeurons } = await import('../src/lib/ai/chat.js');
  const neurons = estimateRequestNeurons('@cf/meta/llama-3.3-70b-instruct-fp8-fast', 'Hello, how are you?');
  assert.ok(typeof neurons === 'number');
  assert.ok(neurons > 0);
});

test('chat: calculateNeuronsFromUsage returns number', async () => {
  const { calculateNeuronsFromUsage } = await import('../src/lib/ai/chat.js');
  const result = calculateNeuronsFromUsage('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { prompt_tokens: 100, completion_tokens: 50 });
  assert.ok(typeof result === 'number');
  assert.ok(result >= 0);
});

test('chat: calculateNeuronsFromUsage handles empty usage', async () => {
  const { calculateNeuronsFromUsage } = await import('../src/lib/ai/chat.js');
  const result = calculateNeuronsFromUsage('@cf/meta/llama-3.3-70b-instruct-fp8-fast', null);
  assert.ok(typeof result === 'number');
});

test('chat: createOptionsResponse returns 204', async () => {
  const { createOptionsResponse } = await import('../src/lib/ai/chat.js');
  const response = createOptionsResponse();
  assert.equal(response.status, 204);
  assert.ok(response.headers.get('Access-Control-Allow-Origin'));
});

test('chat: createSseResponseFromText includes CORS headers', async () => {
  const { createSseResponseFromText } = await import('../src/lib/ai/chat.js');
  const response = createSseResponseFromText('test');
  assert.ok(response.headers.get('Access-Control-Allow-Origin'));
  assert.ok(response.headers.get('Access-Control-Allow-Methods'));
});

test('chat: DEFAULT_SYSTEM_PROMPT is exported', async () => {
  const mod = await import('../src/lib/ai/chat.js');
  assert.ok(typeof mod.DEFAULT_SYSTEM_PROMPT === 'string');
  assert.ok(mod.DEFAULT_SYSTEM_PROMPT.length > 0);
});
