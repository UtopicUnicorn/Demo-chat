import { randomUUID } from "node:crypto";

import type { MessengerAdapter } from "./messengerAdapter.js";
import type { MessengerType } from "../domain/messaging.js";

export function createMessengerAdapter(type: MessengerType): MessengerAdapter {
  return {
    type,
    createMessagePayload({ chat, direction, instance, text }) {
      return {
        direction,
        providerChatId: `${type}:${instance.externalId}:${chat.recipient}`,
        providerMessageId: `${type}:${direction}:${randomUUID()}`,
        text
      };
    }
  };
}
