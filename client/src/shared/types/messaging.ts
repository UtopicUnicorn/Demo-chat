export type MessengerType = "max" | "telegram" | "whatsapp";

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
  title: string;
  recipient: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: Message | null;
};

export type Message = {
  id: string;
  chatId: string;
  instanceId: string;
  messenger: MessengerType;
  direction: MessageDirection;
  providerChatId: string;
  providerMessageId: string;
  text: string;
  status: MessageStatus;
  createdAt: string;
};
