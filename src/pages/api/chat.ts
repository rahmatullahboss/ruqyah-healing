import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';

import { createOptionsResponse, handleChatRequest } from '../../lib/ai/chat.js';

export const prerender = false;

export const OPTIONS: APIRoute = async ({ request }) => {
  return createOptionsResponse(request);
};

export const POST: APIRoute = async ({ request }) => {
  return handleChatRequest(request, env);
};
