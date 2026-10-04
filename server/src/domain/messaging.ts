export const messengerTypes = ["max", "telegram", "whatsapp"] as const;

export type MessengerType = (typeof messengerTypes)[number];

export type InstanceStatus = "connected" | "disconnected";

export type MessageDirection = "incoming" | "outgoing";

export type MessageStatus = "sent" | "delivered" | "read";

export type MessengerInstance = {
  id: string;
  label: string;
  type: MessengerType;
  externalId: string;
  status: InstanceStatus;
};

export type Chat = {
  id: string;
  instanceId: string;
  messenger: MessengerType;
  ownerPhone?: string;
  participantPhones: string[];
  recipient: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: Message | null;
};

export type Message = {
  id: string;
  chatId: string;
  instanceId: string;
  messenger: MessengerType;
  senderPhone?: string;
  direction: MessageDirection;
  providerChatId: string;
  providerMessageId: string;
  text: string;
  status: MessageStatus;
  createdAt: string;
};

export type CreateChatInput = {
  instanceId: string;
  ownerPhone?: string;
  recipient: string;
  title?: string;
};

export type CreateMessageInput = {
  chatId: string;
  providerChatId?: string;
  providerMessageId?: string;
  senderPhone?: string;
  text: string;
};
