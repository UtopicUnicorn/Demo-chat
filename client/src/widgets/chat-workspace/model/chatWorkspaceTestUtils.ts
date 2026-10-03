import { jest } from "@jest/globals";

import { demoChats } from "@/entities/chat/model/demoChats";
import { demoMessages } from "@/entities/message/model/demoMessages";
import type { MessagingApi } from "@/shared/api/messagingApi";
import type { ChatRealtimeConnection, ChatRealtimeOptions } from "@/shared/api/realtimeClient";

export function createApiMock(overrides: Partial<MessagingApi> = {}): MessagingApi {
  return {
    checkHealth: jest.fn<MessagingApi["checkHealth"]>().mockResolvedValue(undefined),
    createChat: jest.fn<MessagingApi["createChat"]>().mockImplementation(async (payload) => {
      const timestamp = "2026-10-03T10:00:00.000Z";

      return {
        createdAt: timestamp,
        id: `${payload.instanceId}-created-chat`,
        instanceId: payload.instanceId,
        lastMessage: null,
        messenger: "max",
        recipient: payload.recipient,
        title: payload.title ?? payload.recipient,
        updatedAt: timestamp
      };
    }),
    listChats: jest
      .fn<MessagingApi["listChats"]>()
      .mockImplementation(async (instanceId) =>
        demoChats.filter((chat) => chat.instanceId === instanceId)
      ),
    listMessages: jest
      .fn<MessagingApi["listMessages"]>()
      .mockImplementation(async (chatId) =>
        demoMessages.filter((message) => message.chatId === chatId)
      ),
    ...overrides
  };
}

export function createRealtimeFactoryMock() {
  const connections: ChatRealtimeOptions[] = [];
  const connection: ChatRealtimeConnection = {
    disconnect: jest.fn(),
    isConnected: jest.fn(() => false),
    sendMessage: jest.fn()
  };
  const realtimeFactory = jest.fn((options: ChatRealtimeOptions) => {
    connections.push(options);
    options.onStatusChange("connected");

    return connection;
  });

  return {
    connection,
    connections,
    realtimeFactory
  };
}
