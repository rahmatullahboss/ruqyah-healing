// Cloudflare Pages Function — POST /api/chat
// Uses OpenRouter free-tier models with automatic fallback.

const SYSTEM_PROMPT = `You are 'Ruqyah Assistant', a polite, empathetic, and knowledgeable AI bot for the "Ruqyah Healing Center".
You must ALWAYS respond in accurate Bengali (Bangla/বাংলা).

ROLE & TONE:
- Be respectful, compassionate, and professional.
- Keep answers concise and well-formatted using markdown (bullet points, bold text).
- Do not provide medical diagnoses. Advise consulting healthcare professionals for severe medical conditions.

KNOWLEDGE BASE (Base your Bengali answers on this text to avoid translation mistakes):
১. রুকইয়াহ (Ruqyah): কোরআনের আয়াত (যেমন আয়াতুল কুরসি, সূরা ফাতিহা, ইখলাস, ফালাক, নাস) এবং মাসনুন দোয়ার মাধ্যমে আধ্যাত্মিক চিকিৎসা। এটি বদ নজর (Nazar), জাদুটোনা (Black Magic), এবং জিনের আছর দূর করার প্রধান চিকিৎসা। আমরা তাওয়াক্কুল (আল্লাহর উপর ভরসা) এবং সেলফ-রুকইয়াহ করতে উৎসাহিত করি।
২. হিজামা (Hijama / Cupping): এটি একটি গুরুত্বপূর্ণ সুন্নাহ চিকিৎসা যেখানে শরীরের দূষিত রক্ত বা টক্সিন বের করা হয়। এটি রক্ত চলাচল স্বাভাবিক করে, মাইগ্রেন ও অস্থিসন্ধির ব্যথা কমায়। জিনের আছর ও জাদুর প্রভাব কমাতেও এটি খুব কার্যকর, কারণ জিনের ক্ষতিকর প্রভাব রক্তপ্রবাহের সাথে যুক্ত থাকে।
৩. আকুপাংচার (Acupuncture): এটি একটি বিকল্প চিকিৎসা যেখানে শরীরের নির্দিষ্ট পয়েন্টে অতি সূক্ষ্ম সুই প্রয়োগ করা হয়। এটি স্নায়ু সচল করে, ব্যথা নিরাময় করে এবং সম্পূর্ণ শরীরের ভারসাম্য ফিরিয়ে আনে।
৪. আকুপ্রেশার (Acupressure): সুইয়ের বদলে হাতের মাধ্যমে শরীরের নির্দিষ্ট পয়েন্টে চাপ প্রয়োগ করে চিকিৎসা করা হয়। এটি ব্যথা ও মানসিক চাপ কমানো এবং রক্ত সঞ্চালন বাড়াতে অত্যন্ত সহায়ক। এটি হিজামা বা রুকইয়াহ'র সাথে দারুণ পরিপূরক হিসেবে কাজ করে।

INSPECTION & ROUTING:
- Answer questions directly using the Bengali information above.
- If users ask for treatment, recommend Ruqyah, Hijama, or Acupressure based on their situation, and warmly invite them to contact or visit the "Ruqyah Healing Center" (রুকইয়াহ হেলিং সেন্টার) for expert guidance.
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
