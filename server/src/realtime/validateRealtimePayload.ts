function hasRequiredString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function readObject(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  return payload as Record<string, unknown>;
}

export function parseChatJoinPayload(payload: unknown) {
  const body = readObject(payload);

  if (!body || !hasRequiredString(body.chatId)) {
    return null;
  }

  return {
    chatId: body.chatId.trim()
  };
}

export function parseInstanceJoinPayload(payload: unknown) {
  const body = readObject(payload);

  if (!body || !hasRequiredString(body.instanceId)) {
    return null;
  }

  return {
    instanceId: body.instanceId.trim()
  };
}

export function parseMessageCommandPayload(payload: unknown) {
  const body = readObject(payload);

  if (!body || !hasRequiredString(body.chatId) || !hasRequiredString(body.text)) {
    return null;
  }

  return {
    chatId: body.chatId.trim(),
    phone: hasRequiredString(body.phone) ? body.phone.trim() : undefined,
    text: body.text.trim()
  };
}
