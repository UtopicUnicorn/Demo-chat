import type { Chat, Message } from "../domain/messaging.js";

export const realtimeEvents = {
  chatJoin: "chat:join",
  chatUpdated: "chat:updated",
  instanceJoin: "instance:join",
  messageCreated: "message:created",
  messageSend: "message:send",
  replySimulate: "reply:simulate"
} as const;

export type RealtimeAck<TData = unknown> =
  | {
      data: TData;
      ok: true;
    }
  | {
      error: {
        message: string;
      };
      ok: false;
    };

export type MessageCommandPayload = {
  chatId: string;
  text: string;
};

export type RoomJoinPayload = {
  chatId?: string;
  instanceId?: string;
};

export type MessageCreatedEvent = {
  chat: Chat;
  message: Message;
};
