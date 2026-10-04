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

function normalizePhone(phone: string) {
  return phone.trim();
}

function getOtherParticipant(participantPhones: string[], phone: string) {
  return participantPhones.find((participantPhone) => participantPhone !== phone) ?? phone;
}

function hasSameParticipants(left: string[], right: string[]) {
  return left.length === right.length && left.every((phone) => right.includes(phone));
}

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

  listChatsForPhone(instanceId: string | undefined, phone: string) {
    const normalizedPhone = normalizePhone(phone);

    return this.listChats(instanceId)
      .filter((chat) => chat.participantPhones.includes(normalizedPhone))
      .map((chat) => this.toViewerChat(chat, normalizedPhone));
  }

  getChat(chatId: string) {
    return this.chats.get(chatId) ?? null;
  }

  createChat(input: CreateChatInput) {
    const instance = this.getInstance(input.instanceId);

    if (!instance) {
      return null;
    }

    const ownerPhone = input.ownerPhone ? normalizePhone(input.ownerPhone) : undefined;
    const recipient = normalizePhone(input.recipient);
    const participantPhones = ownerPhone ? [ownerPhone, recipient] : [recipient];
    const existingChat = ownerPhone
      ? Array.from(this.chats.values()).find(
          (chat) =>
            chat.instanceId === instance.id &&
            hasSameParticipants(chat.participantPhones, participantPhones)
        )
      : undefined;

    if (existingChat) {
      return this.toViewerChat(existingChat, ownerPhone!);
    }

    const timestamp = now();
    const chat: Chat = {
      id: randomUUID(),
      instanceId: instance.id,
      messenger: instance.type,
      ownerPhone,
      participantPhones,
      recipient,
      title: input.title ?? recipient,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastMessage: null
    };

    this.chats.set(chat.id, chat);
    this.messages.set(chat.id, []);

    return ownerPhone ? this.toViewerChat(chat, ownerPhone) : chat;
  }

  listMessages(chatId: string) {
    return this.messages.get(chatId) ?? null;
  }

  listMessagesForPhone(chatId: string, phone: string) {
    const chat = this.getChat(chatId);
    const messages = this.listMessages(chatId);

    if (!chat || !messages) {
      return null;
    }

    const normalizedPhone = normalizePhone(phone);

    if (!chat.participantPhones.includes(normalizedPhone)) {
      return null;
    }

    return messages.map((message) => this.toViewerMessage(message, normalizedPhone));
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
      senderPhone: input.senderPhone ? normalizePhone(input.senderPhone) : undefined,
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

  private toViewerChat(chat: Chat, phone: string) {
    const recipient = getOtherParticipant(chat.participantPhones, phone);
    const lastMessage = chat.lastMessage ? this.toViewerMessage(chat.lastMessage, phone) : null;

    return {
      ...chat,
      lastMessage,
      recipient,
      title: recipient
    };
  }

  private toViewerMessage(message: Message, phone: string) {
    if (!message.senderPhone) {
      return message;
    }

    const direction: MessageDirection = message.senderPhone === phone ? "outgoing" : "incoming";

    return {
      ...message,
      direction
    };
  }
}

export const memoryStore = new MemoryStore();
