import { io, type Socket } from "socket.io-client";

import type { Chat, Message } from "@/shared/types/messaging";

type RealtimeAck<TData = unknown> =
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

type MessageCreatedEvent = {
  chat: Chat;
  message: Message;
};

export type RealtimeStatus = "idle" | "connecting" | "connected" | "error";

export type ChatRealtimeOptions = {
  chatId: string;
  onChatUpdated(chat: Chat): void;
  onMessageCreated(event: MessageCreatedEvent): void;
  onStatusChange(status: RealtimeStatus): void;
};

export type ChatRealtimeConnection = {
  disconnect(): void;
  isConnected(): boolean;
  sendMessage(text: string): void;
};

function getRealtimeOrigin() {
  return import.meta.env.VITE_REALTIME_ORIGIN ?? "http://localhost:4000";
}

export function openChatRealtime({
  chatId,
  onChatUpdated,
  onMessageCreated,
  onStatusChange
}: ChatRealtimeOptions): ChatRealtimeConnection {
  onStatusChange("connecting");

  const socket: Socket = io(getRealtimeOrigin(), {
    transports: ["websocket"]
  });

  socket.on("connect", () => {
    onStatusChange("connected");
    socket.emit("chat:join", { chatId }, (ack: RealtimeAck) => {
      if (!ack.ok) {
        onStatusChange("error");
      }
    });
  });
  socket.on("connect_error", () => onStatusChange("error"));
  socket.on("disconnect", () => onStatusChange("idle"));
  socket.on("chat:updated", (payload: { data: Chat }) => onChatUpdated(payload.data));
  socket.on("message:created", (payload: { data: MessageCreatedEvent }) =>
    onMessageCreated(payload.data)
  );

  return {
    disconnect() {
      socket.disconnect();
    },
    isConnected() {
      return socket.connected;
    },
    sendMessage(text: string) {
      socket.emit("message:send", { chatId, text }, (ack: RealtimeAck<Message>) => {
        if (!ack.ok) {
          onStatusChange("error");
        }
      });
    }
  };
}
