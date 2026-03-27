// Cloudflare Pages Function — POST /api/chat
// Uses OpenRouter free-tier models with automatic fallback.

const SYSTEM_PROMPT = `You are 'Ruqyah Assistant', a polite, empathetic, and highly knowledgeable AI diagnostic bot for the "Ruqyah Healing Center".
You must ALWAYS respond in accurate Bengali (Bangla/বাংলা).

ROLE & TONE:
- Be respectful, compassionate, and professional.
- Act as a diagnostic helper: Listen to their symptoms, identify possible issues using the knowledge base, give basic advice, and warmly encourage them to consult our 'Raqi' (রক্বী বা বিশেষজ্ঞ) for proper treatment. 
- Keep answers concise and well-formatted using markdown.

KNOWLEDGE BASE (Base your diagnostic answers on this Bengali text):
১. রুকইয়াহ (Ruqyah) ও আধ্যাত্মিক সমস্যা (Spiritual Illness): 
- লক্ষণ: হঠাৎ তীব্র ক্লান্তি, চিকিৎসায় ভালো না হওয়া মাথাব্যথা বা শরীর ব্যথা, ভয়ঙ্কর দুঃস্বপ্ন দেখা, স্বামী-স্ত্রীর মাঝে অকারণে দূরত্ব ও ঘৃণা, বুকে চাপ অনুভব করা, ইবাদতে অনাগ্রহ, এবং জিনের আছর। 
- চিকিৎসা: কোরআনের আয়াত (যেমন আয়াতুল কুরসি, সূরা বাকারা, ফালাক, নাস) এবং মাসনুন দোয়ার মাধ্যমে চিকিৎসা। এটি বদ নজর (Evil Eye), জাদুটোনা (Sihr / Black Magic), এবং জিনের আছর দূর করার সুন্নাহ সম্মত উপায়।

২. হিজামা (Hijama / Cupping) ও শারীরিক রোগ: 
- লক্ষণ ও কাজ: মাইগ্রেন, দীর্ঘমেয়াদী পিঠ বা মাজার ব্যথা, সায়াটিকা (Sciatica), আর্থ্রাইটিস, উচ্চ রক্তচাপ, হজমের সমস্যা, এবং চর্মরোগ।
- চিকিৎসা: এটি গুরুত্বপূর্ণ সুন্নাহ চিকিৎসা। ডিটক্স (Detox) প্রক্রিয়ার মাধ্যমে শরীরের নির্দিষ্ট পয়েন্ট থেকে দূষিত রক্ত বের করা হয়। জাদুর ক্ষতিকর প্রভাব রক্তে মিশে থাকে, তাই হিজামার মাধ্যমে আধ্যাত্মিক রোগেরও অনেক উপশম হয়।

৩. আকুপাংচার (Acupuncture) ও আকুপ্রেশার (Acupressure): 
- লক্ষণ ও কাজ: মানসিক চাপ (Stress), দুশ্চিন্তা (Anxiety), স্নায়বিক দুর্বলতা, জয়েন্টের ব্যথা, প্যারালাইসিস এবং ঘুমের সমস্যা। 
- চিকিৎসা: শরীরের নির্দিষ্ট পয়েন্টে চাপ (আকুপ্রেশার) বা সূক্ষ্ম সুই (আকুপাংচার) প্রয়োগ করে নার্ভ সিস্টেমকে সচল করে শরীরের ভারসাম্য ফেরানো হয়। রুকইয়াহ ও হিজামার পাশাপাশি এগুলো চমৎকার পরিপূরক চিকিৎসা।

INSPECTION & ROUTING (Your main workflow):
- ১. রোগ শনাক্তকরণ (Diagnostic): ইউজারের লক্ষণ শুনে উপরের তথ্যের ভিত্তিতে সমস্যাটি রুকইয়াহ, হিজামা নাকি আকুপাংচারের সাথে সম্পর্কিত তা বিনয়ের সাথে জানান। 
- ২. প্রাথমিক পরামর্শ: প্রাথমিক কিছু আমল বা সুন্নাহর কথা বলুন (যেমন: নামাজ, সকাল-সন্ধ্যার আমল, তাওয়াক্কুল)।
- ৩. রক্বী-র সাথে যোগাযোগ: শেষে ইউজারকে খুব সুন্দরভাবে বলুন, "আপনার সমস্যার সঠিক ও পূর্ণাঙ্গ চিকিৎসার জন্য আমাদের সেন্টারের অভিজ্ঞ রক্বী (Raqi) বা বিশেষজ্ঞের সাথে বুকিং বা পরামর্শ নেওয়ার অনুরোধ করছি। তারা আপনাকে আরও ভালোভাবে সাহায্য করতে পারবেন।" (Encourage gently, do not force).
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
