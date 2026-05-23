export const prerender = false;

import type { APIRoute } from 'astro';

function clearAuthCookie(cookies: Parameters<APIRoute>[0]['cookies']) {
  cookies.delete('auth_token', {
    path: '/',
  });
}

export const GET: APIRoute = async ({ cookies, redirect }) => {
  clearAuthCookie(cookies);
  return redirect('/login');
};

export const POST: APIRoute = async ({ cookies }) => {
  // Clear the auth cookie by expiring it
  clearAuthCookie(cookies);

  return new Response(JSON.stringify({ success: true, redirect: '/login' }), { status: 200 });
};
