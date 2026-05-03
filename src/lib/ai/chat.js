import { z } from 'zod';
import { createDb } from '../../db/client.js';
import { siteSettings, aiChatLogs } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const DEFAULT_SYSTEM_PROMPT = `আপনি "Ruqyah Healing Center" ওয়েবসাইটের mixed clinic assistant।
আপনি সাধারণ ইসলামিক/রুকইয়াহ গাইডেন্স দিতে পারবেন, কিন্তু আপনার primary কাজ হলো clinic flow support করা: symptom triage, test selection, self-ruqyah direction, service guidance, এবং appointment conversion।

অবশ্যপালনীয় নিয়ম:
- সবসময় প্রাকৃতিক, শুদ্ধ, সংক্ষিপ্ত বাংলা লিখবেন।
- user interface-এ already welcome message আছে। তাই প্রতিটি reply-এর শুরুতে সালাম, হ্যালো, শুভেচ্ছা, "আমি সাহায্য করতে এখানে আছি" টাইপ opener লিখবেন না।
- user যদি নিজে সালাম দেয়, তখন একবার সংক্ষিপ্তভাবে উত্তর দিতে পারবেন। বারবার greeting নয়।
- অযথা লম্বা paragraph লিখবেন না।
- markdown-friendly structure ব্যবহার করবেন।
- diagnosis বা চিকিৎসা নিয়ে অতিরিক্ত certainty দেখাবেন না।
- medical emergency, আত্মহানির ঝুঁকি, তীব্র বুকব্যথা, শ্বাসকষ্ট, খিঁচুনি, অচেতনতা, গর্ভাবস্থার জটিলতা ইত্যাদি থাকলে দ্রুত ডাক্তার/হাসপাতালের পরামর্শ দিতে হবে।

ওয়েবসাইট context:
- /symptom-diagnosis: user symptoms select করে প্রাথমিক direction পায়।
- /ruqyah-diagnosis: test নির্বাচন পেজ।
- /ruqyah-diagnosis/general: অনির্দিষ্ট/মিশ্র সমস্যার জন্য।
- /ruqyah-diagnosis/evil-eye: বদনজর/হাসাদ।
- /ruqyah-diagnosis/magic: যাদু।
- /ruqyah-diagnosis/jinn: জিনের প্রভাব।
- /ruqyah-diagnosis/waswasa: ওয়াসওয়াসা/obsessive intrusive thoughts।
- /ruqyah-diagnosis/kids: শিশুদের টেস্ট।
- /self-ruqyah: self-ruqyah resources।
- /appointment: রাকীর appointment।

Symptom diagnosis themes:
- শারীরিক: ঘুমের সমস্যা, মাথাব্যথা, বুক ধড়ফড়, ক্লান্তি, চোখের সমস্যা, জ্বালাপোড়া, মাথা ঘোরা, শরীরের ব্যথা।
- মানসিক: উদ্বেগ, ব্যক্তিত্বের পরিবর্তন, অদ্ভুত অনুভূতি, বিষণ্নতা, একা থাকতে ভয়।
- সামাজিক: দাম্পত্য সমস্যা, কাজ/ব্যবসায় বাধা, সামাজিক সম্পর্কে বাধা, সন্তান না হওয়া।
- ধর্মীয়: কুরআনে অস্বস্তি, ইবাদতে মনোযোগ না থাকা।

Service context:
- রুকইয়াহ: জিন, জাদু, বদনজর, ওয়াসওয়াসা, আধ্যাত্মিক সমস্যার জন্য।
- হিজামা: migraine, back pain, sciatica, arthritis, high blood pressure, digestion, skin issues এর supportive Sunnah-based therapy।
- আকুপাংচার/আকুপ্রেশার: stress, anxiety, nerve weakness, joint pain, paralysis, sleep issues এর supportive care।

Intent handling:
- symptom/সমস্যা message এলে সরাসরি final diagnosis দেবে না। আগে 1-3টা focused follow-up question করবে।
- user যদি জিজ্ঞেস করে "কোন টেস্ট দিব?", symptoms থেকে best route suggest করবে।
- user যদি clinic service জানতে চায়, relevant service explain করবে।
- general Ruqyah/Islamic question হলে concise answer দেবে, তবে clinic context থেকে বিচ্ছিন্ন হবে না।
- appointment CTA তখনই জোর দেবে যখন symptoms significant, recurring, distressing, or user asks for treatment/help।

Preferred response format:
- ২ থেকে ৪টি ছোট section।
- section heading bold হবে।
- bullets দরকার হলে '-' ব্যবহার করবে।
- default structure:
  **সম্ভাব্য দিক**
  ১-২ লাইন

  **আরও জানতে চাই**
  - প্রশ্ন ১
  - প্রশ্ন ২

  **এখন কী করবেন**
  - relevant page link
  - প্রয়োজন হলে appointment

  **সতর্কীকরণ**
  ১ লাইন, natural language-এ

Formatting rules:
- এক reply-এ 120-170 শব্দের বেশি লিখবেন না, unless user specifically asks for detail।
- একই sentence বারবার repeat করবেন না।
- যদি user খুব ছোট message দেয়, concise follow-up করবেন।
- markdown links ব্যবহার করবেন, যেমন [সিমটম ডায়াগনোসিস](/symptom-diagnosis)
- appointment link forced footer হিসেবে সব reply-এ লিখবেন না।

Hard boundaries:
- হারাম/শিরক/তাবিজ/ভণ্ডামি recommend করবেন না।
- নিজেকে final authority বা doctor/mufti হিসেবে উপস্থাপন করবেন না।
- uncertainty থাকলে বলবেন এটি প্রাথমিক দিকনির্দেশনা।`;

const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const SECONDARY_MODEL = '@cf/mistral/mistral-small-3.1-24b-instruct';
const MAX_OUTPUT_TOKENS = 450;
const DEFAULT_DAILY_NEURON_LIMIT = 10_000;
const DEFAULT_NEURON_RATES = {
  inputPerMillion: 50_000,
  outputPerMillion: 100_000,
};
const MODEL_NEURON_RATES = {
  [DEFAULT_MODEL]: DEFAULT_NEURON_RATES,
  [SECONDARY_MODEL]: {
    inputPerMillion: 31_371,
    outputPerMillion: 50_560,
  },
};
const FREE_LIMIT_MESSAGE = 'আজকের AI ফ্রি লিমিট শেষ হয়েছে। আগামীকাল আবার চেষ্টা করুন, অথবা আপাতত [সিমটম ডায়াগনোসিস](/symptom-diagnosis) / [রুকইয়াহ ডায়াগনোসিস](/ruqyah-diagnosis) ব্যবহার করুন।';

const ALLOWED_ORIGINS = [
  'https://ruqyahhealing.com',
  'https://ruqyah-healing.pages.dev',
];

function getCorsOrigin(request) {
  const origin = request?.headers?.get?.('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // Allow localhost for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return origin;
  return ALLOWED_ORIGINS[0];
}

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().trim().min(1),
    }),
  ).min(1),
});

function jsonResponse(payload, status = 200, request = null) {
  const origin = request ? getCorsOrigin(request) : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
  });
}

export function isWorkersAiFreeLimitError(error) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const status = 'status' in error ? error.status : undefined;
  const code = 'code' in error ? error.code : undefined;
  const message = 'message' in error && typeof error.message === 'string' ? error.message : '';

  return status === 429 || code === 3036 || /10,000 neurons|daily free allocation|neurons/i.test(message);
}

function buildModelList(configuredModel) {
  return [...new Set([configuredModel?.trim(), DEFAULT_MODEL, SECONDARY_MODEL].filter(Boolean))];
}

function extractTextFromAiResult(result) {
  if (typeof result === 'string') {
    return result;
  }

  if (result && typeof result === 'object') {
    const candidateTexts = [
      result.response,
      result.result?.response,
      result.output_text,
      result.p,
      result.text,
      result.content,
      result.choices?.[0]?.message?.content,
      result.choices?.[0]?.delta?.content,
      result.choices?.[0]?.text,
    ];

    for (const candidate of candidateTexts) {
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate;
      }
    }
  }

  return '';
}

function getNeuronRates(model) {
  return MODEL_NEURON_RATES[model] ?? DEFAULT_NEURON_RATES;
}

function estimateTokens(text) {
  if (!text) {
    return 0;
  }

  return Math.ceil(text.length / 2);
}

export function estimateRequestNeurons(model, promptText, maxOutputTokens = MAX_OUTPUT_TOKENS) {
  const rates = getNeuronRates(model);
  const promptTokens = estimateTokens(promptText);
  const promptNeurons = (promptTokens * rates.inputPerMillion) / 1_000_000;
  const completionNeurons = (maxOutputTokens * rates.outputPerMillion) / 1_000_000;
  return Math.ceil(promptNeurons + completionNeurons);
}

export function calculateNeuronsFromUsage(model, usage, promptText = '', completionText = '') {
  const rates = getNeuronRates(model);
  const promptTokens = usage?.prompt_tokens ?? estimateTokens(promptText);
  const completionTokens = usage?.completion_tokens ?? estimateTokens(completionText);
  const promptNeurons = (promptTokens * rates.inputPerMillion) / 1_000_000;
  const completionNeurons = (completionTokens * rates.outputPerMillion) / 1_000_000;
  return Math.ceil(promptNeurons + completionNeurons);
}

function getBudgetKey(now = new Date()) {
  return `daily-neurons:${now.toISOString().slice(0, 10)}`;
}

function getSecondsUntilNextUtcMidnight(now = new Date()) {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.ceil((next.getTime() - now.getTime()) / 1000));
}

function getDailyNeuronLimit(workerEnv) {
  const configured = Number(workerEnv?.AI_DAILY_NEURON_LIMIT);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_DAILY_NEURON_LIMIT;
}

function getOllamaFallbackConfig(workerEnv) {
  const baseUrl = workerEnv?.OLLAMA_BASE_URL?.trim?.() || '';
  if (!baseUrl) {
    return null;
  }

  try {
    const parsed = new URL(baseUrl);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname === '0.0.0.0'
      || hostname === '::1'
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return {
    baseUrl,
    model: workerEnv?.OLLAMA_MODEL || 'llama3',
    apiKey: workerEnv?.OLLAMA_API_KEY || '',
  };
}

async function getBudgetState(workerEnv, now = new Date()) {
  if (!workerEnv?.AI_BUDGET?.get) {
    return { usedNeurons: 0, key: getBudgetKey(now) };
  }

  const key = getBudgetKey(now);
  const raw = await workerEnv.AI_BUDGET.get(key);

  if (!raw) {
    return { usedNeurons: 0, key };
  }

  try {
    const parsed = JSON.parse(raw);
    const usedNeurons = Number(parsed?.usedNeurons);
    return {
      usedNeurons: Number.isFinite(usedNeurons) && usedNeurons > 0 ? usedNeurons : 0,
      key,
    };
  } catch {
    return { usedNeurons: 0, key };
  }
}

async function addBudgetUsage(workerEnv, neurons, now = new Date()) {
  if (!workerEnv?.AI_BUDGET?.put || !Number.isFinite(neurons) || neurons <= 0) {
    return;
  }

  const { usedNeurons, key } = await getBudgetState(workerEnv, now);
  await workerEnv.AI_BUDGET.put(
    key,
    JSON.stringify({
      usedNeurons: usedNeurons + Math.ceil(neurons),
      updatedAt: now.toISOString(),
    }),
    { expirationTtl: getSecondsUntilNextUtcMidnight(now) },
  );
}

async function getActiveSystemPrompt(workerEnv) {
  try {
    if (!workerEnv?.DATABASE_URL) return DEFAULT_SYSTEM_PROMPT;
    const db = createDb(workerEnv.DATABASE_URL);
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ai_system_prompt'));
    if (row?.value && typeof row.value === 'string' && row.value.trim()) {
      return row.value;
    }
  } catch {}
  return DEFAULT_SYSTEM_PROMPT;
}

async function logChatConversation(workerEnv, { userMessage, aiResponse, model, neuronsUsed, clientIp }) {
  try {
    if (!workerEnv?.DATABASE_URL) return;
    const db = createDb(workerEnv.DATABASE_URL);
    await db.insert(aiChatLogs).values({
      id: crypto.randomUUID(),
      sessionId: 'web',
      userMessage: (userMessage || '').slice(0, 2000),
      aiResponse: (aiResponse || '').slice(0, 2000),
      model: model || '',
      neuronsUsed: neuronsUsed || 0,
      clientIp: clientIp || '',
    });
  } catch (err) {
    console.error('[AI Chat] Failed to log conversation:', err);
  }
}

function buildPromptText(messages, systemPrompt) {
  return [{ role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT }, ...messages]
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n');
}

function toOpenAiDeltaEvent(text) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
}

function parseStreamChunk(dataString, previousText) {
  if (!dataString || dataString === '[DONE]') {
    return { done: dataString === '[DONE]', nextText: previousText, delta: '' };
  }

  let candidateText = '';

  try {
    const parsed = JSON.parse(dataString);
    candidateText = extractTextFromAiResult(parsed);
  } catch {
    candidateText = dataString;
  }

  if (!candidateText) {
    return { done: false, nextText: previousText, delta: '' };
  }

  if (candidateText.startsWith(previousText)) {
    return {
      done: false,
      nextText: candidateText,
      delta: candidateText.slice(previousText.length),
    };
  }

  return {
    done: false,
    nextText: previousText + candidateText,
    delta: candidateText,
  };
}

export function createSseResponseFromText(text, request = null) {
  const origin = request ? getCorsOrigin(request) : ALLOWED_ORIGINS[0];
  const encoder = new TextEncoder();
  const ssePayload = [
    toOpenAiDeltaEvent(text).trimEnd(),
    '',
    'data: [DONE]',
    '',
  ].join('\n');

  return new Response(encoder.encode(ssePayload), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export function createOpenAiCompatibleSseResponse(upstreamStream, options = {}, request = null) {
  const origin = request ? getCorsOrigin(request) : ALLOWED_ORIGINS[0];
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;
  let buffer = '';
  let previousText = '';
  let latestUsage;

  const transformed = new ReadableStream({
    async start(controller) {
      const reader = upstreamStream.getReader();

      try {
        let rawChunkCount = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          rawChunkCount++;
          if (rawChunkCount <= 3) {
            console.log(`[AI Stream Debug] chunk #${rawChunkCount}: ${JSON.stringify(chunk.slice(0, 300))}`);
          }
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Handle both 'data: ...' and 'data:...' formats
            let dataString = '';
            if (trimmedLine.startsWith('data:')) {
              dataString = trimmedLine.slice(5).trim();
            } else {
              // Some CF AI streams emit raw JSON without 'data:' prefix
              dataString = trimmedLine;
            }

            if (!dataString) continue;

            if (dataString !== '[DONE]') {
              try {
                const parsedData = JSON.parse(dataString);
                if (parsedData?.usage && typeof parsedData.usage === 'object') {
                  latestUsage = parsedData.usage;
                }
              } catch {
                // ignore non-JSON chunks
              }
            }
            const parsed = parseStreamChunk(dataString, previousText);
            previousText = parsed.nextText;

            if (parsed.delta) {
              controller.enqueue(encoder.encode(toOpenAiDeltaEvent(parsed.delta)));
            }

            if (parsed.done) {
              if (onComplete) {
                await onComplete({ completionText: previousText, usage: latestUsage });
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }
          }
        }

        if (onComplete) {
          await onComplete({ completionText: previousText, usage: latestUsage });
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(transformed, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export function createOptionsResponse(request = null) {
  const origin = request ? getCorsOrigin(request) : ALLOWED_ORIGINS[0];
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function handleChatRequest(request, workerEnv) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({
      error: 'Could not parse request body as JSON',
      detail: String(error),
    }, 400, request);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({
      error: "Invalid request: 'messages' must be a non-empty array",
      detail: parsed.error.flatten(),
    }, 400, request);
  }

  const models = buildModelList(workerEnv.AI_MODEL);
  const activePrompt = await getActiveSystemPrompt(workerEnv);
  const promptText = buildPromptText(parsed.data.messages, activePrompt);
  const now = new Date();
  const budgetState = await getBudgetState(workerEnv, now);
  const dailyNeuronLimit = getDailyNeuronLimit(workerEnv);
  const clientIp = request.headers.get('cf-connecting-ip') || '';
  const lastUserMsg = parsed.data.messages[parsed.data.messages.length - 1]?.content || '';
  const ollamaConfig = getOllamaFallbackConfig(workerEnv);

  if (workerEnv?.AI?.run) {
    for (const model of models) {
      const projectedNeurons = estimateRequestNeurons(model, promptText, MAX_OUTPUT_TOKENS);

      if (budgetState.usedNeurons + projectedNeurons > dailyNeuronLimit) {
        console.warn(`[AI Chat] Budget limit reached for ${model}, skipping CF AI.`);
        break; 
      }

      // Try non-streaming first (returns properly decoded text)
      try {
        console.log(`[AI Chat] Trying model (non-stream): ${model}`);
        const result = await workerEnv.AI.run(model, {
          messages: [
            { role: 'system', content: activePrompt },
            ...parsed.data.messages,
          ],
          max_tokens: MAX_OUTPUT_TOKENS,
          temperature: 0.45,
        });
        const text = extractTextFromAiResult(result);

        if (text) {
          const neurons = calculateNeuronsFromUsage(model, result?.usage, promptText, text);
          await addBudgetUsage(workerEnv, neurons);
          await logChatConversation(workerEnv, { userMessage: lastUserMsg, aiResponse: text, model, neuronsUsed: neurons, clientIp });
          return createSseResponseFromText(text, request);
        }
        console.warn(`[AI Chat] Non-streaming returned empty text for ${model}`);
      } catch (error) {
        if (isWorkersAiFreeLimitError(error)) {
          console.warn(`[AI Chat] Workers AI free limit hit for ${model}.`);
          break;
        }
        console.error(`[AI Chat] Workers AI non-streaming failed for ${model}:`, error);
      }

      // Streaming fallback
      try {
        const stream = await workerEnv.AI.run(model, {
          messages: [
            { role: 'system', content: activePrompt },
            ...parsed.data.messages,
          ],
          stream: true,
          max_tokens: MAX_OUTPUT_TOKENS,
          temperature: 0.45,
        });

        if (stream instanceof ReadableStream) {
          return createOpenAiCompatibleSseResponse(stream, {
            onComplete: async ({ completionText, usage }) => {
              const neurons = calculateNeuronsFromUsage(model, usage, promptText, completionText);
              await addBudgetUsage(workerEnv, neurons);
              await logChatConversation(workerEnv, { userMessage: lastUserMsg, aiResponse: completionText, model, neuronsUsed: neurons, clientIp });
            },
          }, request);
        }
      } catch (error) {
        if (isWorkersAiFreeLimitError(error)) {
          console.warn(`[AI Chat] Workers AI free limit hit for ${model}.`);
          break;
        }
        console.error(`[AI Chat] Workers AI stream failed for ${model}:`, error);
      }
    }
  } else {
    console.warn('[AI Chat] Workers AI binding unavailable, checking fallback providers.');
  }

  // --- OLLAMA FALLBACK ---
  if (ollamaConfig) {
    try {
      const response = await fetch(`${ollamaConfig.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ollamaConfig.apiKey ? { "Authorization": `Bearer ${ollamaConfig.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: ollamaConfig.model,
          messages: [
            { role: 'system', content: activePrompt },
            ...parsed.data.messages,
          ],
          stream: true,
          max_tokens: MAX_OUTPUT_TOKENS,
          temperature: 0.45,
        })
      });

      if (response.ok && response.body) {
        return createOpenAiCompatibleSseResponse(response.body, {
          onComplete: async ({ completionText }) => {
            await logChatConversation(workerEnv, { 
              userMessage: lastUserMsg, 
              aiResponse: completionText, 
              model: `ollama:${ollamaConfig.model}`, 
              neuronsUsed: 0, 
              clientIp 
            });
          }
        }, request);
      } else {
        const errBody = await response.text().catch(() => "");
        console.error(`[AI Chat] Ollama fallback failed: ${response.status} ${errBody.slice(0, 200)}`);
      }
    } catch (error) {
      console.error(`[AI Chat] Ollama fallback fetch error:`, error);
    }
  }

  return jsonResponse({
    error: FREE_LIMIT_MESSAGE,
  }, 503, request);
}
