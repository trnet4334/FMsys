function badRequest(message) {
  return { status: 400, body: { error: message } };
}

export async function postSnapshotTrigger(req, deps) {
  if (req.method !== 'POST') {
    return { status: 405, body: { error: 'method not allowed' } };
  }

  const body = req.body ?? {};
  const { userId, snapshotType, accountScope = [] } = body;

  if (!userId || !snapshotType) {
    return badRequest('userId and snapshotType are required');
  }

  const payload = {
    userId,
    snapshotType,
    accountScope,
    triggeredAt: new Date().toISOString(),
  };

  await deps.enqueue('snapshot.trigger', payload);

  return {
    status: 202,
    body: {
      accepted: true,
      job: 'snapshot.trigger',
    },
  };
}
