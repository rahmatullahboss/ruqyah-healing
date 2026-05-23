/**
 * Server-side Analytics Utilities
 * Implements GA4 Measurement Protocol and Meta Conversions API (CAPI).
 */

export interface AnalyticsContext {
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  externalId?: string;
  email?: string;
  phone?: string;
}

type AnalyticsEnv = {
  PUBLIC_GA_MEASUREMENT_ID?: string;
  GA_API_SECRET?: string;
  PUBLIC_META_PIXEL_ID?: string;
  META_ACCESS_TOKEN?: string;
  META_TEST_EVENT_CODE?: string;
};

type MetaCAPIOptions = {
  eventId?: string;
  eventTime?: number;
  testEventCode?: string;
  env?: AnalyticsEnv;
};

/**
 * Hash PII data using SHA-256 as required by Meta CAPI
 */
async function hashData(data: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(data.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

function getProcessEnv(): AnalyticsEnv {
  return ((globalThis as any).process?.env || {}) as AnalyticsEnv;
}

function stripEmptyValues<T extends Record<string, any>>(values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  ) as Partial<T>;
}

/**
 * Extract tracking context from Astro Request
 */
export function getAnalyticsContext(request: Request, clientIp?: string): AnalyticsContext {
  const headers = request.headers;
  const userAgent = headers.get('user-agent') || undefined;
  
  // Extract cookies
  const cookieHeader = headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('=')).filter(([k]) => k)
  );

  return {
    clientIp,
    userAgent,
    fbp: cookies['_fbp'],
    fbc: cookies['_fbc'],
  };
}

/**
 * Send event to GA4 via Measurement Protocol
 */
export async function sendGA4Event(
  eventName: string,
  params: Record<string, any> = {},
  context: AnalyticsContext,
  env: AnalyticsEnv = getProcessEnv(),
) {
  const measurementId = env.PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = env.GA_API_SECRET;

  if (!measurementId || !apiSecret) return;

  const clientId = context.fbp || 'anonymous'; // Fallback to anonymous if no fbp

  try {
    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        events: [{
          name: eventName,
          params: {
            ...params,
            client_ip: context.clientIp,
            user_agent: context.userAgent,
          },
        }],
      }),
    });
  } catch (err) {
    console.error('[GA4 Error]', err);
  }
}

/**
 * Build Meta CAPI payload.
 */
export async function buildMetaCAPIEventPayload(
  eventName: string,
  customData: Record<string, any> = {},
  context: AnalyticsContext,
  options: MetaCAPIOptions = {},
) {
  const userData: Record<string, any> = {
    client_ip_address: context.clientIp,
    client_user_agent: context.userAgent,
    fbp: context.fbp,
    fbc: context.fbc,
  };

  if (context.externalId) {
    userData.external_id = [await hashData(context.externalId)];
  }

  if (context.email) {
    userData.em = [await hashData(context.email)];
  }

  if (context.phone) {
    const normalizedPhone = normalizePhone(context.phone);
    if (normalizedPhone) userData.ph = [await hashData(normalizedPhone)];
  }

  const payload: Record<string, any> = {
    data: [
      stripEmptyValues({
        event_name: eventName,
        event_time: options.eventTime || Math.floor(Date.now() / 1000),
        event_id: options.eventId,
        action_source: 'website',
        user_data: stripEmptyValues(userData),
        custom_data: customData,
      }),
    ],
  };

  if (options.testEventCode) {
    payload.test_event_code = options.testEventCode;
  }

  return payload;
}

/**
 * Send event to Meta CAPI
 */
export async function sendMetaCAPIEvent(
  eventName: string,
  customData: Record<string, any> = {},
  context: AnalyticsContext,
  options: MetaCAPIOptions = {},
) {
  const env = options.env || getProcessEnv();
  const pixelId = env.PUBLIC_META_PIXEL_ID;
  const accessToken = env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) return;

  try {
    const payload = await buildMetaCAPIEventPayload(eventName, customData, context, {
      ...options,
      testEventCode: options.testEventCode || env.META_TEST_EVENT_CODE,
    });

    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Meta CAPI Error]', await response.text());
    }
  } catch (err) {
    console.error('[Meta CAPI Error]', err);
  }
}
