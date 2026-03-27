interface Env {
  OPENROUTER_API_KEY: string;
}

const SYSTEM_PROMPT =
  "You are a helpful AI assistant for the 'Ruqyah Healing Center' website. " +
  "You guide users about Ruqyah, Islamic healing, evil eye (Nazar), black magic (Sihr), " +
  "and Jinn possession based on Quran and Sunnah. Be polite, compassionate, and reply in " +
  "Bengali (Bangla). Keep responses short and to the point. Output nicely formatted markdown.";

// Free models on OpenRouter — tried in order.
// Append :free to use the free tier variant.
const MODELS = [
  "stepfun/step-3.5-flash:free",
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) {
  try {
    const body = (await request.json()) as { messages?: any[] };
    const messages = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return jsonResponse({ error: "Invalid messages array format" }, 400);
    }

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "API key is not configured" }, 500);
    }

    // Try each free model in order until one succeeds
    for (const model of MODELS) {
      const result = await callOpenRouter(apiKey, model, messages);

      if (result.ok) {
        return new Response(result.body, {
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      // If 402 (payment required) or 429 (rate-limited), try the next model
      if (result.status === 402 || result.status === 429) {
        continue;
      }

      // Any other error — stop and report
      const errText = await result.text().catch(() => "Unknown error");
      console.error(`[AI Chat] ${model} failed (${result.status}): ${errText}`);
      return jsonResponse(
        { error: "AI সার্ভিসে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।" },
        result.status,
      );
    }

    // All models exhausted
    return jsonResponse(
      {
        error:
          "বর্তমানে AI সার্ভিস অস্থায়ীভাবে বন্ধ আছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      },
      503,
    );
  } catch (err) {
    console.error("[AI Chat] Unhandled error:", err);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

// ── Helpers ──────────────────────────────────────────────────────

async function callOpenRouter(
  apiKey: string,
  model: string,
  userMessages: any[],
): Promise<Response> {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://ruqyah-healing.pages.dev",
      "X-Title": "Ruqyah Healing Center",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...userMessages],
      stream: true,
    }),
  });
}

function jsonResponse(data: Record<string, string>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

