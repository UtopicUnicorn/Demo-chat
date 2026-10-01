import type {
  Chat,
  MessageDirection,
  MessengerInstance,
  MessengerType
} from "../domain/messaging.js";

export type AdapterMessagePayload = {
  direction: MessageDirection;
  providerChatId: string;
  providerMessageId: string;
  text: string;
};

export type MessengerAdapter = {
  type: MessengerType;
  createMessagePayload(params: {
    chat: Chat;
    direction: MessageDirection;
    instance: MessengerInstance;
    text: string;
  }): AdapterMessagePayload;
};
