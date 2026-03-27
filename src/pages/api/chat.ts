import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const { request, locals } = context;
    const body = await request.json();
    const messages = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages array format" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Attempt to read from Cloudflare env vars, then fallback to import.meta.env
    // @ts-ignore
    const env = locals?.runtime?.env || import.meta.env;
    const apiKey = env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("Missing OPENROUTER_API_KEY environment variable");
      return new Response(JSON.stringify({ error: "API key is not configured" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const openRouterRequest = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ruqyah-healing.pages.dev", 
        "X-Title": "Ruqyah Healing Center",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
             role: "system",
             content: "You are a helpful AI assistant for the 'Ruqyah Healing Center' website. You guide users about Ruqyah, Islamic healing, evil eye (Nazar), black magic (Sihr), and Jinn possession based on Quran and Sunnah. Be polite, compassionate, and reply in Bengali (Bangla). Keep responses short and to the point. Output nicely formatted markdown."
          },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!openRouterRequest.ok) {
      const errorData = await openRouterRequest.text();
      console.error("OpenRouter API error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to connect to AI provider" }), { 
        status: openRouterRequest.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Return the Event Stream
    return new Response(openRouterRequest.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (err) {
    console.error("Error in AI Agent API route:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
