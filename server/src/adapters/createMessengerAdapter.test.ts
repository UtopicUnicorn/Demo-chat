import { createMessengerAdapter } from "./createMessengerAdapter.js";
import type { Chat, MessengerInstance } from "../domain/messaging.js";

const instance: MessengerInstance = {
  externalId: "max-demo-instance",
  id: "max-main",
  label: "MAX Main",
  status: "connected",
  type: "max"
};

const chat: Chat = {
  createdAt: "2026-10-01T00:00:00.000Z",
  id: "chat-id",
  instanceId: "max-main",
  lastMessage: null,
  messenger: "max",
  recipient: "+79991234567",
  title: "Demo contact",
  updatedAt: "2026-10-01T00:00:00.000Z"
};

describe("createMessengerAdapter", () => {
  it("creates provider metadata for outgoing messages", () => {
    const adapter = createMessengerAdapter("max");

    const payload = adapter.createMessagePayload({
      chat,
      direction: "outgoing",
      instance,
      text: "Hello"
    });

    expect(payload).toEqual(
      expect.objectContaining({
        direction: "outgoing",
        providerChatId: "max:max-demo-instance:+79991234567",
        text: "Hello"
      })
    );
    expect(payload.providerMessageId).toMatch(/^max:outgoing:/);
  });
});
