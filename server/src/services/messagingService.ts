import { getMessengerAdapter } from "../adapters/adapterRegistry.js";
import type {
  Chat,
  CreateChatInput,
  CreateMessageInput,
  Message,
  MessageDirection
} from "../domain/messaging.js";
import type { MemoryStore } from "../store/memoryStore.js";

export type MessagingEvents = {
  chatUpdated(chat: Chat): void;
  messageCreated(message: Message, chat: Chat): void;
};

const noopMessagingEvents: MessagingEvents = {
  chatUpdated() {},
  messageCreated() {}
};

export class MessagingService {
  constructor(
    private readonly store: MemoryStore,
    private readonly events: MessagingEvents = noopMessagingEvents
  ) {}

  listChats(instanceId?: string) {
    return this.store.listChats(instanceId);
  }

  createChat(input: CreateChatInput) {
    const chat = this.store.createChat(input);

    if (chat) {
      this.events.chatUpdated(chat);
    }

    return chat;
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

    const message = this.store.createMessage(
      {
        chatId: chat.id,
        providerChatId: payload.providerChatId,
        providerMessageId: payload.providerMessageId,
        text: payload.text
      },
      payload.direction
    );

    const updatedChat = this.store.getChat(chat.id);

    if (message && updatedChat) {
      this.events.messageCreated(message, updatedChat);
      this.events.chatUpdated(updatedChat);
    }

    return message;
  }
}
