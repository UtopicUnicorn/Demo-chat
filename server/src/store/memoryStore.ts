import { randomUUID } from "node:crypto";

import type {
  Chat,
  CreateChatInput,
  CreateMessageInput,
  Message,
  MessageDirection,
  MessengerInstance
} from "../domain/messaging.js";

const now = () => new Date().toISOString();

const instances: MessengerInstance[] = [
  {
    id: "max-main",
    label: "MAX Main",
    type: "max",
    externalId: "max-demo-instance",
    status: "connected"
  },
  {
    id: "telegram-main",
    label: "Telegram Main",
    type: "telegram",
    externalId: "telegram-demo-bot",
    status: "connected"
  },
  {
    id: "whatsapp-main",
    label: "WhatsApp Main",
    type: "whatsapp",
    externalId: "whatsapp-demo-instance",
    status: "connected"
  }
];

export class MemoryStore {
  private readonly instances = instances;
  private readonly chats = new Map<string, Chat>();
  private readonly messages = new Map<string, Message[]>();

  listInstances() {
    return this.instances;
  }

  getInstance(instanceId: string) {
    return this.instances.find((instance) => instance.id === instanceId) ?? null;
  }

  listChats(instanceId?: string) {
    const chats = Array.from(this.chats.values());

    if (!instanceId) {
      return chats;
    }

    return chats.filter((chat) => chat.instanceId === instanceId);
  }

  getChat(chatId: string) {
    return this.chats.get(chatId) ?? null;
  }

  createChat(input: CreateChatInput) {
    const instance = this.getInstance(input.instanceId);

    if (!instance) {
      return null;
    }

    const timestamp = now();
    const chat: Chat = {
      id: randomUUID(),
      instanceId: instance.id,
      messenger: instance.type,
      recipient: input.recipient,
      title: input.title ?? input.recipient,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastMessage: null
    };

    this.chats.set(chat.id, chat);
    this.messages.set(chat.id, []);

    return chat;
  }

  listMessages(chatId: string) {
    return this.messages.get(chatId) ?? null;
  }

  createMessage(input: CreateMessageInput, direction: MessageDirection = "outgoing") {
    const chat = this.getChat(input.chatId);

    if (!chat) {
      return null;
    }

    const message: Message = {
      id: randomUUID(),
      chatId: chat.id,
      instanceId: chat.instanceId,
      messenger: chat.messenger,
      direction,
      providerChatId: input.providerChatId ?? chat.recipient,
      providerMessageId: input.providerMessageId ?? randomUUID(),
      text: input.text,
      status: direction === "outgoing" ? "sent" : "delivered",
      createdAt: now()
    };

    const messages = this.messages.get(chat.id) ?? [];
    messages.push(message);
    this.messages.set(chat.id, messages);
    this.chats.set(chat.id, {
      ...chat,
      updatedAt: message.createdAt,
      lastMessage: message
    });

    return message;
  }
}

export const memoryStore = new MemoryStore();
