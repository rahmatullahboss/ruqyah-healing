/**
 * WhatsApp Click Tracking API
 * Tracks WhatsApp button clicks via Meta CAPI for analytics
 */

import { getAnalyticsContext, sendGA4Event, sendMetaCAPIEvent } from '../../../lib/analytics';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json().catch(() => ({})) as {
      eventName?: string;
      source?: string;
      campaign?: string;
      eventId?: string;
      phone?: string;
    };

    const context = getAnalyticsContext(request);

    // Add phone if provided for better matching
    if (body.phone) {
      context.phone = body.phone;
    }

    const eventName = body.eventName || 'Contact';
    const customData = {
      content_name: 'WhatsApp Click',
      content_category: 'booking',
      source: body.source || 'landing_page',
      campaign: body.campaign || '',
    };

    // Send to both GA4 and Meta CAPI
    await Promise.all([
      sendGA4Event('whatsapp_click', {
        ...customData,
        event_category: 'engagement',
      }, context),
      sendMetaCAPIEvent(eventName, customData, context, {
        eventId: body.eventId,
        testEventCode: (globalThis as any).process?.env?.META_TEST_EVENT_CODE,
      }),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[WhatsApp Tracking Error]', err);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}