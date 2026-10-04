import { useCallback, useEffect, useRef, useState } from "react";

import type { MessagingApi } from "@/shared/api/messagingApi";
import type { Chat, Message } from "@/shared/types/messaging";
import {
  toCurrentUserChat,
  toCurrentUserMessage,
  upsertChat,
  upsertMessage
} from "@/widgets/chat-workspace/model/chatWorkspaceModel";

export type BackendStatus = "checking" | "available" | "unavailable";

type UseChatWorkspaceDataOptions = {
  activeChatId: string;
  activeChatIdsByInstance: Record<string, string>;
  activeInstanceId: string;
  api: MessagingApi;
  currentUserPhone: string;
  isConversationOpen: boolean;
  setActiveChatId: (updater: (currentChatId: string) => string) => void;
};

export function useChatWorkspaceData({
  activeChatId,
  activeChatIdsByInstance,
  activeInstanceId,
  api,
  currentUserPhone,
  isConversationOpen,
  setActiveChatId
}: UseChatWorkspaceDataOptions) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const isMountedRef = useRef(false);
  const loadedInstanceIdsRef = useRef(new Set<string>());
  const loadingInstanceIdsRef = useRef(new Set<string>());
  const loadedMessageChatIdsRef = useRef(new Set<string>());
  const loadingMessageChatIdsRef = useRef(new Set<string>());

  const activeChat = activeChatId ? chats.find((chat) => chat.id === activeChatId) : undefined;

  useEffect(() => {
    setChats([]);
    setMessages([]);
    loadedInstanceIdsRef.current.clear();
    loadingInstanceIdsRef.current.clear();
    loadedMessageChatIdsRef.current.clear();
    loadingMessageChatIdsRef.current.clear();
  }, [currentUserPhone]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function checkBackend() {
      try {
        await api.checkHealth();

        if (!isMountedRef.current) {
          return;
        }

        setBackendStatus("available");
      } catch {
        if (!isMountedRef.current) {
          return;
        }

        setBackendStatus("unavailable");
        setChats([]);
        setMessages([]);
        setActiveChatId((currentChatId) => currentChatId || "");
      }
    }

    void checkBackend();
  }, [api, setActiveChatId]);

  useEffect(() => {
    if (
      !currentUserPhone ||
      backendStatus !== "available" ||
      loadedInstanceIdsRef.current.has(activeInstanceId) ||
      loadingInstanceIdsRef.current.has(activeInstanceId)
    ) {
      return;
    }

    loadingInstanceIdsRef.current.add(activeInstanceId);

    api
      .listChats(activeInstanceId, currentUserPhone)
      .then((loadedChats) => {
        if (!isMountedRef.current) {
          return;
        }

        setChats((currentChats) => {
          const chatsFromOtherInstances = currentChats.filter(
            (chat) => chat.instanceId !== activeInstanceId
          );

          return [
            ...chatsFromOtherInstances,
            ...loadedChats.map((chat) => toCurrentUserChat(chat, currentUserPhone))
          ];
        });
        setActiveChatId((currentChatId) => {
          if (loadedChats.some((chat) => chat.id === currentChatId)) {
            return currentChatId;
          }

          const rememberedChatId = activeChatIdsByInstance[activeInstanceId];

          if (rememberedChatId && loadedChats.some((chat) => chat.id === rememberedChatId)) {
            return rememberedChatId;
          }

          return "";
        });
        loadedInstanceIdsRef.current.add(activeInstanceId);
      })
      .catch(() => {
        loadedInstanceIdsRef.current.delete(activeInstanceId);
      })
      .finally(() => {
        loadingInstanceIdsRef.current.delete(activeInstanceId);
      });
  }, [
    activeChatIdsByInstance,
    activeInstanceId,
    api,
    backendStatus,
    currentUserPhone,
    setActiveChatId
  ]);

  useEffect(() => {
    if (
      !activeChat?.id ||
      !currentUserPhone ||
      !isConversationOpen ||
      backendStatus !== "available" ||
      loadedMessageChatIdsRef.current.has(activeChat.id) ||
      loadingMessageChatIdsRef.current.has(activeChat.id)
    ) {
      return;
    }

    const chatId = activeChat.id;
    loadingMessageChatIdsRef.current.add(chatId);

    api
      .listMessages(chatId, currentUserPhone)
      .then((loadedMessages) => {
        if (!isMountedRef.current) {
          return;
        }

        setMessages((currentMessages) => {
          const messagesFromOtherChats = currentMessages.filter(
            (message) => message.chatId !== chatId
          );

          return [
            ...messagesFromOtherChats,
            ...loadedMessages.map((message) => toCurrentUserMessage(message, currentUserPhone))
          ];
        });
        loadedMessageChatIdsRef.current.add(chatId);
      })
      .catch(() => {
        loadedMessageChatIdsRef.current.delete(chatId);
      })
      .finally(() => {
        loadingMessageChatIdsRef.current.delete(chatId);
      });
  }, [activeChat?.id, api, backendStatus, currentUserPhone, isConversationOpen]);

  const applyChat = useCallback(
    (chat: Chat) => {
      setChats((currentChats) =>
        upsertChat(currentChats, toCurrentUserChat(chat, currentUserPhone))
      );
    },
    [currentUserPhone]
  );

  const applyMessage = useCallback(
    (message: Message) => {
      setMessages((currentMessages) =>
        upsertMessage(currentMessages, toCurrentUserMessage(message, currentUserPhone))
      );
    },
    [currentUserPhone]
  );

  const applyOutgoingMessage = useCallback((outgoingMessage: Message) => {
    setMessages((currentMessages) => upsertMessage(currentMessages, outgoingMessage));
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === outgoingMessage.chatId
          ? {
              ...chat,
              lastMessage: outgoingMessage,
              updatedAt: outgoingMessage.createdAt
            }
          : chat
      )
    );
  }, []);

  return {
    activeChat,
    applyChat,
    applyMessage,
    applyOutgoingMessage,
    backendStatus,
    chats,
    messages,
    setChats
  };
}
