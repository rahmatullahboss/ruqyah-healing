interface Env {
  OPENROUTER_API_KEY: string;
}

export async function onRequestPost({ request, env }: { request: Request, env: Env }) {
  try {
    const body = await request.json() as { messages?: any[] };
    const messages = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages array format" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = env.OPENROUTER_API_KEY;

    if (!apiKey) {
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
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
