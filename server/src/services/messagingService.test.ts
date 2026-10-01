import { MessagingService } from "./messagingService.js";
import { MemoryStore } from "../store/memoryStore.js";

describe("MessagingService", () => {
  it("creates messages through the selected messenger adapter", () => {
    const store = new MemoryStore();
    const service = new MessagingService(store);
    const chat = service.createChat({
      instanceId: "telegram-main",
      recipient: "@demo_user"
    });

    expect(chat).not.toBeNull();

    const message = service.createMessage({
      chatId: chat!.id,
      text: "Hello"
    });

    expect(message).toEqual(
      expect.objectContaining({
        direction: "outgoing",
        messenger: "telegram",
        providerChatId: "telegram:telegram-demo-bot:@demo_user",
        status: "sent",
        text: "Hello"
      })
    );
    expect(message?.providerMessageId).toMatch(/^telegram:outgoing:/);
  });

  it("returns null when the chat does not exist", () => {
    const service = new MessagingService(new MemoryStore());

    expect(
      service.createMessage({
        chatId: "unknown-chat",
        text: "Hello"
      })
    ).toBeNull();
  });
});
