import type { Chat, Message } from "@/shared/types/messaging";

export function upsertChat(chats: Chat[], nextChat: Chat) {
  return chats.some((chat) => chat.id === nextChat.id)
    ? chats.map((chat) => (chat.id === nextChat.id ? nextChat : chat))
    : [nextChat, ...chats];
}

export function upsertMessage(messages: Message[], nextMessage: Message) {
  return messages.some((message) => message.id === nextMessage.id)
    ? messages.map((message) => (message.id === nextMessage.id ? nextMessage : message))
    : [...messages, nextMessage];
}

export function createLocalOutgoingMessage(activeChat: Chat, text: string): Message {
  const createdAt = new Date().toISOString();

  return {
    chatId: activeChat.id,
    createdAt,
    direction: "outgoing",
    id: `local-${Date.now()}`,
    instanceId: activeChat.instanceId,
    messenger: activeChat.messenger,
    providerChatId: activeChat.recipient,
    providerMessageId: `local-provider-${Date.now()}`,
    status: "sent",
    text
  };
}

export function toCurrentUserChat(chat: Chat, currentUserPhone: string): Chat {
  const recipient =
    chat.participantPhones.find((phone) => phone !== currentUserPhone) ?? chat.recipient;

  return {
    ...chat,
    lastMessage: chat.lastMessage ? toCurrentUserMessage(chat.lastMessage, currentUserPhone) : null,
    recipient,
    title: recipient
  };
}

export function toCurrentUserMessage(message: Message, currentUserPhone: string): Message {
  if (!message.senderPhone) {
    return message;
  }

  return {
    ...message,
    direction: message.senderPhone === currentUserPhone ? "outgoing" : "incoming"
  };
}
