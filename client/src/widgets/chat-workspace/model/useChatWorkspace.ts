import { useEffect, useMemo, useRef, useState } from "react";

import { demoChats } from "@/entities/chat/model/demoChats";
import { demoInstances } from "@/entities/instance/model/demoInstances";
import { demoMessages } from "@/entities/message/model/demoMessages";
import { messagingApi, type MessagingApi } from "@/shared/api/messagingApi";
import {
  type ChatRealtimeConnection,
  type ChatRealtimeOptions,
  openChatRealtime,
  type RealtimeStatus
} from "@/shared/api/realtimeClient";
import type { Chat, Message } from "@/shared/types/messaging";

type BackendStatus = "checking" | "available" | "unavailable";

export type UseChatWorkspaceOptions = {
  api?: MessagingApi;
  realtimeFactory?: (options: ChatRealtimeOptions) => ChatRealtimeConnection;
};

function upsertChat(chats: Chat[], nextChat: Chat) {
  return chats.some((chat) => chat.id === nextChat.id)
    ? chats.map((chat) => (chat.id === nextChat.id ? nextChat : chat))
    : [nextChat, ...chats];
}

function upsertMessage(messages: Message[], nextMessage: Message) {
  return messages.some((message) => message.id === nextMessage.id)
    ? messages.map((message) => (message.id === nextMessage.id ? nextMessage : message))
    : [...messages, nextMessage];
}

function createLocalOutgoingMessage(activeChat: Chat, text: string): Message {
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

export function useChatWorkspace({
  api = messagingApi,
  realtimeFactory = openChatRealtime
}: UseChatWorkspaceOptions = {}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeInstanceId, setActiveInstanceId] = useState(demoInstances[0].id);
  const [activeChatId, setActiveChatId] = useState("");
  const [activeChatIdsByInstance, setActiveChatIdsByInstance] = useState<Record<string, string>>(
    {}
  );
  const [conversationOpenByInstance, setConversationOpenByInstance] = useState<
    Record<string, boolean>
  >({});
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("idle");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const realtimeConnectionRef = useRef<ChatRealtimeConnection | null>(null);
  const isMountedRef = useRef(false);
  const loadedInstanceIdsRef = useRef(new Set<string>());
  const loadingInstanceIdsRef = useRef(new Set<string>());
  const loadedMessageChatIdsRef = useRef(new Set<string>());
  const loadingMessageChatIdsRef = useRef(new Set<string>());

  const visibleChats = useMemo(
    () => chats.filter((chat) => chat.instanceId === activeInstanceId),
    [activeInstanceId, chats]
  );
  const activeChat = activeChatId ? chats.find((chat) => chat.id === activeChatId) : undefined;
  const activeInstance = demoInstances.find((instance) => instance.id === activeInstanceId);
  const activeMessages = messages.filter((message) => message.chatId === activeChat?.id);

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
        setChats(demoChats);
        setMessages(demoMessages);
        setActiveChatId((currentChatId) => currentChatId || demoChats[0]?.id || "");
      }
    }

    void checkBackend();
  }, [api]);

  useEffect(() => {
    if (
      backendStatus !== "available" ||
      loadedInstanceIdsRef.current.has(activeInstanceId) ||
      loadingInstanceIdsRef.current.has(activeInstanceId)
    ) {
      return;
    }

    loadingInstanceIdsRef.current.add(activeInstanceId);

    api
      .listChats(activeInstanceId)
      .then((loadedChats) => {
        if (!isMountedRef.current) {
          return;
        }

        setChats((currentChats) => {
          const chatsFromOtherInstances = currentChats.filter(
            (chat) => chat.instanceId !== activeInstanceId
          );

          return [...chatsFromOtherInstances, ...loadedChats];
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
  }, [activeChatIdsByInstance, activeInstanceId, api, backendStatus]);

  useEffect(() => {
    if (
      !activeChat?.id ||
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
      .listMessages(chatId)
      .then((loadedMessages) => {
        if (!isMountedRef.current) {
          return;
        }

        setMessages((currentMessages) => {
          const messagesFromOtherChats = currentMessages.filter(
            (message) => message.chatId !== chatId
          );

          return [...messagesFromOtherChats, ...loadedMessages];
        });
        loadedMessageChatIdsRef.current.add(chatId);
      })
      .catch(() => {
        loadedMessageChatIdsRef.current.delete(chatId);
      })
      .finally(() => {
        loadingMessageChatIdsRef.current.delete(chatId);
      });
  }, [activeChat?.id, api, backendStatus, isConversationOpen]);

  useEffect(() => {
    realtimeConnectionRef.current?.disconnect();
    realtimeConnectionRef.current = null;
    setRealtimeStatus("idle");

    if (!activeChat?.id || !isConversationOpen) {
      return;
    }

    const connection = realtimeFactory({
      chatId: activeChat.id,
      onChatUpdated(chat) {
        setChats((currentChats) => upsertChat(currentChats, chat));
      },
      onMessageCreated({ chat, message }) {
        setMessages((currentMessages) => upsertMessage(currentMessages, message));
        setChats((currentChats) => upsertChat(currentChats, chat));
      },
      onStatusChange: setRealtimeStatus
    });

    realtimeConnectionRef.current = connection;

    return () => {
      connection.disconnect();

      if (realtimeConnectionRef.current === connection) {
        realtimeConnectionRef.current = null;
      }
    };
  }, [activeChat?.id, isConversationOpen, realtimeFactory]);

  function selectInstance(instanceId: string) {
    setActiveInstanceId(instanceId);
    setActiveChatId(activeChatIdsByInstance[instanceId] ?? "");
    setIsConversationOpen(Boolean(conversationOpenByInstance[instanceId]));
  }

  function selectChat(chatId: string) {
    setActiveChatId(chatId);
    setActiveChatIdsByInstance((currentChatIds) => ({
      ...currentChatIds,
      [activeInstanceId]: chatId
    }));
    setConversationOpenByInstance((currentOpenState) => ({
      ...currentOpenState,
      [activeInstanceId]: true
    }));
    setIsConversationOpen(true);
  }

  function closeConversation() {
    setConversationOpenByInstance((currentOpenState) => ({
      ...currentOpenState,
      [activeInstanceId]: false
    }));
    setIsConversationOpen(false);
  }

  async function createChat() {
    if (!activeInstance || isCreatingChat) {
      return;
    }

    setApiError(null);
    setIsCreatingChat(true);

    const chatNumber = visibleChats.length + 1;
    const recipient = `demo-chat-${chatNumber}`;

    try {
      const createdChat = await api.createChat({
        instanceId: activeInstance.id,
        title: "Новый чат",
        recipient
      });

      setChats((currentChats) => upsertChat(currentChats, createdChat));
      setActiveChatId(createdChat.id);
      setActiveChatIdsByInstance((currentChatIds) => ({
        ...currentChatIds,
        [activeInstance.id]: createdChat.id
      }));
      setConversationOpenByInstance((currentOpenState) => ({
        ...currentOpenState,
        [activeInstance.id]: true
      }));
      setIsConversationOpen(true);
    } catch {
      setApiError("Не удалось создать чат");
    } finally {
      setIsCreatingChat(false);
    }
  }

  function applyOutgoingMessage(outgoingMessage: Message) {
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
  }

  function sendMessage() {
    const normalizedText = messageText.trim();

    if (!normalizedText || !activeChat) {
      return;
    }

    const realtimeConnection = realtimeConnectionRef.current;

    if (realtimeConnection?.isConnected()) {
      realtimeConnection.sendMessage(normalizedText);
      setMessageText("");
      return;
    }

    applyOutgoingMessage(createLocalOutgoingMessage(activeChat, normalizedText));
    setMessageText("");
  }

  const backendStatusLabel = {
    available: "Бэкенд доступен",
    checking: "Проверка бэкенда",
    unavailable: "Бэкенд недоступен"
  }[backendStatus];

  const realtimeStatusLabel = {
    connected: "WS подключен",
    connecting: "WS подключается",
    error: "WS ошибка",
    idle: "WS отключен"
  }[realtimeStatus];

  return {
    activeChat,
    activeChatId,
    activeInstance,
    activeInstanceId,
    activeMessages,
    apiError,
    backendStatus,
    backendStatusLabel,
    closeConversation,
    createChat,
    isConversationOpen,
    isCreatingChat,
    messageText,
    messages,
    realtimeStatus,
    realtimeStatusLabel,
    selectChat,
    selectInstance,
    sendMessage,
    setMessageText,
    visibleChats
  };
}
