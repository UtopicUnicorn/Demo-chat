import { getMessengerAdapter } from "../adapters/adapterRegistry.js";
import type { CreateChatInput, CreateMessageInput, MessageDirection } from "../domain/messaging.js";
import type { MemoryStore } from "../store/memoryStore.js";

export class MessagingService {
  constructor(private readonly store: MemoryStore) {}

  listChats(instanceId?: string) {
    return this.store.listChats(instanceId);
  }

  createChat(input: CreateChatInput) {
    return this.store.createChat(input);
  }

  listMessages(chatId: string) {
    return this.store.listMessages(chatId);
  }

  createMessage(input: CreateMessageInput, direction: MessageDirection = "outgoing") {
    const chat = this.store.getChat(input.chatId);

    if (!chat) {
      return null;
    }

    const instance = this.store.getInstance(chat.instanceId);

    if (!instance) {
      return null;
    }

    const adapter = getMessengerAdapter(instance.type);

    if (!adapter) {
      return null;
    }

    const payload = adapter.createMessagePayload({
      chat,
      direction,
      instance,
      text: input.text
    });

    return this.store.createMessage(
      {
        chatId: chat.id,
        providerChatId: payload.providerChatId,
        providerMessageId: payload.providerMessageId,
        text: payload.text
      },
      payload.direction
    );
  }
}
