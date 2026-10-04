import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { config } from "../config.js";
import type { Chat, Message, MessageDirection } from "../domain/messaging.js";
import type { MessagingEvents, MessagingService } from "../services/messagingService.js";
import {
  type MessageCommandPayload,
  type MessageCreatedEvent,
  type RealtimeAck,
  type RoomJoinPayload,
  realtimeEvents
} from "./events.js";
import { chatRoom, instanceRoom } from "./rooms.js";
import {
  parseChatJoinPayload,
  parseInstanceJoinPayload,
  parseMessageCommandPayload
} from "./validateRealtimePayload.js";

type AckCallback<TData = unknown> = (ack: RealtimeAck<TData>) => void;

function emitAckError<TData>(ack: AckCallback<TData> | undefined, message: string) {
  ack?.({
    error: {
      message
    },
    ok: false
  });
}

export class RealtimeHub implements MessagingEvents {
  private readonly io: Server;

  constructor(
    httpServer: HttpServer,
    private readonly messagingService: MessagingService
  ) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.clientOrigin
      }
    });

    this.registerHandlers();
  }

  chatUpdated(chat: Chat) {
    this.io
      .to(instanceRoom(chat.instanceId))
      .to(chatRoom(chat.id))
      .emit(realtimeEvents.chatUpdated, {
        data: chat
      });
  }

  messageCreated(message: Message, chat: Chat) {
    const event: MessageCreatedEvent = {
      chat,
      message
    };

    this.io
      .to(instanceRoom(message.instanceId))
      .to(chatRoom(message.chatId))
      .emit(realtimeEvents.messageCreated, {
        data: event
      });
  }

  private registerHandlers() {
    this.io.on("connection", (socket) => {
      socket.on(realtimeEvents.instanceJoin, (payload: RoomJoinPayload, ack?: AckCallback) => {
        const parsedPayload = parseInstanceJoinPayload(payload);

        if (!parsedPayload) {
          emitAckError(ack, "instanceId is required");
          return;
        }

        socket.join(instanceRoom(parsedPayload.instanceId));
        ack?.({ data: parsedPayload, ok: true });
      });

      socket.on(realtimeEvents.chatJoin, (payload: RoomJoinPayload, ack?: AckCallback) => {
        const parsedPayload = parseChatJoinPayload(payload);

        if (!parsedPayload) {
          emitAckError(ack, "chatId is required");
          return;
        }

        socket.join(chatRoom(parsedPayload.chatId));
        ack?.({ data: parsedPayload, ok: true });
      });

      socket.on(
        realtimeEvents.messageSend,
        (payload: MessageCommandPayload, ack?: AckCallback<Message>) => {
          this.createMessage(payload, "outgoing", ack);
        }
      );

      socket.on(
        realtimeEvents.replySimulate,
        (payload: MessageCommandPayload, ack?: AckCallback<Message>) => {
          this.createMessage(payload, "incoming", ack);
        }
      );
    });
  }

  private createMessage(
    payload: MessageCommandPayload,
    direction: MessageDirection,
    ack?: AckCallback<Message>
  ) {
    const parsedPayload = parseMessageCommandPayload(payload);

    if (!parsedPayload) {
      emitAckError(ack, "chatId and text are required");
      return;
    }

    const message = this.messagingService.createMessage(
      {
        chatId: parsedPayload.chatId,
        senderPhone: parsedPayload.phone,
        text: parsedPayload.text
      },
      direction
    );

    if (!message) {
      emitAckError(ack, "Chat not found");
      return;
    }

    ack?.({
      data: message,
      ok: true
    });
  }
}

export function createRealtimeHub(httpServer: HttpServer, messagingService: MessagingService) {
  return new RealtimeHub(httpServer, messagingService);
}
