import crypto from 'node:crypto';

export class InMemoryIdempotencyStore {
  constructor() {
    this.keys = new Set();
  }

  has(key) {
    return this.keys.has(key);
  }

  add(key) {
    this.keys.add(key);
  }
}

function computeSignature(body, secret) {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
}

export async function postSnapshotReadyWebhook(req, deps) {
  if (req.method !== 'POST') {
    return { status: 405, body: { error: 'method not allowed' } };
  }

  const signature = req.headers?.['x-signature'];
  const expected = computeSignature(req.body ?? {}, deps.webhookSecret);

  if (!signature || signature !== expected) {
    return { status: 401, body: { error: 'invalid signature' } };
  }

  const eventId = req.body?.eventId;
  if (!eventId) {
    return { status: 400, body: { error: 'eventId is required' } };
  }

  if (deps.idempotency.has(eventId)) {
    return { status: 409, body: { error: 'duplicate event' } };
  }

  deps.idempotency.add(eventId);

  return { status: 202, body: { accepted: true } };
}
