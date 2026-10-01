import { createMessengerAdapter } from "./createMessengerAdapter.js";
import type { MessengerAdapter } from "./messengerAdapter.js";
import type { MessengerType } from "../domain/messaging.js";

const adapters = new Map<MessengerType, MessengerAdapter>([
  ["max", createMessengerAdapter("max")],
  ["telegram", createMessengerAdapter("telegram")],
  ["whatsapp", createMessengerAdapter("whatsapp")]
]);

export function getMessengerAdapter(type: MessengerType) {
  return adapters.get(type) ?? null;
}
