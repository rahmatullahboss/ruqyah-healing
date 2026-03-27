// Cloudflare Pages Function — POST /api/chat
// Uses OpenRouter free-tier models with automatic fallback.

const SYSTEM_PROMPT =
  "You are a helpful AI assistant for the 'Ruqyah Healing Center' website. " +
  "You guide users about Ruqyah, Islamic healing, evil eye (Nazar), black magic (Sihr), " +
  "and Jinn possession based on Quran and Sunnah. Be polite, compassionate, and reply in " +
  "Bengali (Bangla). Keep responses short and to the point. Output nicely formatted markdown.";

const MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// CORS preflight
export function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

// Main handler
export async function onRequestPost(context: any) {
  try {
    // Safely extract request and env from context
    const request = context.request;
    const env = context.env || {};
    const apiKey = env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return json({ error: "OPENROUTER_API_KEY not configured" }, 500);
    }

    // Parse body with detailed error handling
    let body: any;
    try {
      body = await request.json();
    } catch (parseErr) {
      return json({ error: "Could not parse request body as JSON", detail: String(parseErr) }, 400);
    }

    const messages = body?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return json({
        error: "Invalid request: 'messages' must be a non-empty array",
        received: JSON.stringify(body).slice(0, 200),
      }, 400);
    }

    // Try each free model in order
    for (const model of MODELS) {
      let result: Response;
      try {
        result = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://ruqyah-healing.pages.dev",
            "X-Title": "Ruqyah Healing Center",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages,
            ],
            stream: true,
          }),
        });
      } catch (fetchErr) {
        console.error(`[AI Chat] fetch error for ${model}:`, fetchErr);
        continue;
      }

      if (result.ok) {
        return new Response(result.body, {
          headers: {
            ...CORS,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }

      // 402 or 429 → try next model
      if (result.status === 402 || result.status === 429) {
        console.log(`[AI Chat] ${model} → ${result.status}, trying next...`);
        continue;
      }

      // Other error → report
      const errBody = await result.text().catch(() => "");
      console.error(`[AI Chat] ${model} → ${result.status}: ${errBody}`);
      return json({ error: "AI সার্ভিসে সমস্যা হচ্ছে।" }, 502);
    }

    // All models exhausted
    return json({
      error: "বর্তমানে AI সার্ভিস অস্থায়ীভাবে বন্ধ আছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
    }, 503);

  } catch (err: any) {
    console.error("[AI Chat] Unhandled:", err);
    return json({ error: "Internal Server Error", detail: String(err) }, 500);
  }
}
