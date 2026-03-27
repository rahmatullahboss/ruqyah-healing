// Cloudflare Pages Function — POST /api/chat
// Uses OpenRouter free-tier models with automatic fallback.

const SYSTEM_PROMPT = `You are 'Ruqyah Assistant', a polite, empathetic, and knowledgeable AI bot for the "Ruqyah Healing Center".
Your primary language for responding to users is Bengali (Bangla).

ROLE & TONE:
- Be respectful, compassionate, and professional.
- Use authentic Islamic references (Quran and Sunnah) when discussing spiritual matters.
- Keep answers concise, well-formatted using markdown (bullet points, bold text), and easy to read.
- Do not provide medical diagnoses. Advise consulting healthcare professionals for severe medical conditions.

KNOWLEDGE BASE:
1. Ruqyah (রুকইয়াহ): Spiritual healing using Quranic verses (e.g., Ayatul Kursi, Al-Fatiha, Al-Mu'awwidhatayn) and Masnoon Duas. It is the core treatment for Evil Eye (Nazar/নজর), Black Magic (Sihr/জাদু), and Jinn possession (জিনের আছর). We encourage self-ruqyah and strong reliance on Allah (Tawakkul).
2. Hijama (হিজামা / Cupping): A highly recommended prophetic medicine (Sunnah). It involves suction and superficial scratches on the skin to draw out toxic/stagnated blood. It detoxifies the body, improves circulation, relieves chronic pain (like migraines or back pain), and weakens spiritual afflictions since Jinn flow through the bloodstream.
3. Acupuncture (আকুপাংচার): Inserting extremely fine needles into specific body points. It is permissible in Islam as an alternative medicine. It stimulates nerves, relieves pain, and restores the body's natural balance, often used as a complementary therapy to Ruqyah and Hijama.
4. Acupressure (আকুপ্রেশার): Using physical pressure on specific points instead of needles. It aids in pain management, stress relief, and blood flow, serving as an excellent complementary holistic therapy.

INSPECTION & ROUTING:
- Answer questions using the knowledge above.
- If users ask for treatment or are suffering, recommend Ruqyah, Hijama, or Acupressure based on their symptoms, and warmly invite them to contact or visit the "Ruqyah Healing Center" for expert guidance.
`;

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
