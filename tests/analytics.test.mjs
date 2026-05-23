import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import {
  buildMetaCAPIEventPayload,
  getAnalyticsContext,
} from '../src/lib/analytics.ts';

test('getAnalyticsContext extracts Meta cookies and request identity', () => {
  const request = new Request('https://ruqyahhealing.com/api/appointments', {
    headers: {
      cookie: '_fbp=fb.1.123.456; _fbc=fb.1.123.click',
      'user-agent': 'node-test-agent',
    },
  });

  const context = getAnalyticsContext(request, '203.0.113.10');

  assert.equal(context.clientIp, '203.0.113.10');
  assert.equal(context.userAgent, 'node-test-agent');
  assert.equal(context.fbp, 'fb.1.123.456');
  assert.equal(context.fbc, 'fb.1.123.click');
});

test('buildMetaCAPIEventPayload includes event id and hashed lead identity', async () => {
  const payload = await buildMetaCAPIEventPayload(
    'Lead',
    {
      content_category: 'ruqyah_booking',
      currency: 'BDT',
      value: 500,
    },
    {
      clientIp: '203.0.113.10',
      userAgent: 'node-test-agent',
      fbp: 'fb.1.123.456',
      fbc: 'fb.1.123.click',
      externalId: 'appointment-123',
      email: ' Test@Example.COM ',
      phone: ' +8801992575874 ',
    },
    {
      eventId: 'lead-appointment-123',
      eventTime: 1770000000,
      testEventCode: 'TEST123',
    },
  );

  const event = payload.data[0];

  assert.equal(event.event_name, 'Lead');
  assert.equal(event.event_id, 'lead-appointment-123');
  assert.equal(event.event_time, 1770000000);
  assert.equal(event.action_source, 'website');
  assert.equal(event.user_data.client_ip_address, '203.0.113.10');
  assert.equal(event.user_data.client_user_agent, 'node-test-agent');
  assert.equal(event.user_data.fbp, 'fb.1.123.456');
  assert.equal(event.user_data.fbc, 'fb.1.123.click');
  assert.deepEqual(event.user_data.external_id, [
    createHash('sha256').update('appointment-123').digest('hex'),
  ]);
  assert.deepEqual(event.user_data.em, [
    createHash('sha256').update('test@example.com').digest('hex'),
  ]);
  assert.deepEqual(event.user_data.ph, [
    createHash('sha256').update('8801992575874').digest('hex'),
  ]);
  assert.equal(payload.test_event_code, 'TEST123');
});
