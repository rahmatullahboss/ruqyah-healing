export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  // Clear the auth cookie by expiring it
  cookies.delete('auth_token', {
    path: '/',
  });
  
  return new Response(JSON.stringify({ success: true, redirect: '/login' }), { status: 200 });
};
