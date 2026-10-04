import { useCallback, useMemo, useState } from "react";

import { demoInstances } from "@/entities/instance/model/demoInstances";
import { messagingApi, type MessagingApi } from "@/shared/api/messagingApi";
import {
  type ChatRealtimeConnection,
  type ChatRealtimeOptions,
  openChatRealtime
} from "@/shared/api/realtimeClient";
import {
  createLocalOutgoingMessage,
  toCurrentUserChat
} from "@/widgets/chat-workspace/model/chatWorkspaceModel";
import { useChatRealtimeSubscription } from "@/widgets/chat-workspace/model/useChatRealtimeSubscription";
import { useChatWorkspaceData } from "@/widgets/chat-workspace/model/useChatWorkspaceData";
import { useChatWorkspaceSelection } from "@/widgets/chat-workspace/model/useChatWorkspaceSelection";

export type UseChatWorkspaceOptions = {
  api?: MessagingApi;
  currentUserPhone?: string;
  realtimeFactory?: (options: ChatRealtimeOptions) => ChatRealtimeConnection;
};

export function useChatWorkspace({
  api = messagingApi,
  currentUserPhone = "",
  realtimeFactory = openChatRealtime
}: UseChatWorkspaceOptions = {}) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [newChatRecipient, setNewChatRecipient] = useState("");

  const {
    activeChatId,
    activeChatIdsByInstance,
    activeInstanceId,
    closeConversation,
    isConversationOpen,
    rememberActiveChat,
    selectChat,
    selectInstance,
    setActiveChatId
  } = useChatWorkspaceSelection(currentUserPhone);

  const {
    activeChat,
    applyChat,
    applyMessage,
    applyOutgoingMessage,
    backendStatus,
    chats,
    messages
  } = useChatWorkspaceData({
    activeChatId,
    activeChatIdsByInstance,
    activeInstanceId,
    api,
    currentUserPhone,
    isConversationOpen,
    setActiveChatId
  });

  const onChatUpdated = useCallback(
    (chat: Parameters<typeof applyChat>[0]) => {
      applyChat(chat);
    },
    [applyChat]
  );

  const onMessageCreated = useCallback(
    ({ chat, message }: Parameters<ChatRealtimeOptions["onMessageCreated"]>[0]) => {
      applyMessage(message);
      applyChat(chat);
    },
    [applyChat, applyMessage]
  );

  const { realtimeStatus } = useChatRealtimeSubscription({
    activeChatId: activeChat?.id,
    currentUserPhone,
    isConversationOpen,
    onChatUpdated,
    onMessageCreated,
    realtimeFactory
  });

  const visibleChats = useMemo(
    () => chats.filter((chat) => chat.instanceId === activeInstanceId),
    [activeInstanceId, chats]
  );
  const activeInstance = demoInstances.find((instance) => instance.id === activeInstanceId);
  const activeMessages = messages.filter((message) => message.chatId === activeChat?.id);

  async function createChat() {
    const recipient = newChatRecipient.trim();

    if (!activeInstance || !currentUserPhone || !recipient || isCreatingChat) {
      return;
    }

    setApiError(null);
    setIsCreatingChat(true);

    try {
      const createdChat = await api.createChat({
        instanceId: activeInstance.id,
        phone: currentUserPhone,
        recipient
      });

      applyChat(createdChat);
      rememberActiveChat(activeInstance.id, createdChat.id);
      setNewChatRecipient("");
    } catch {
      setApiError("Не удалось создать чат");
    } finally {
      setIsCreatingChat(false);
    }
  }

  function sendMessage() {
    const normalizedText = messageText.trim();

    if (!normalizedText || !activeChat) {
      return;
    }

    if (currentUserPhone) {
      void api
        .sendMessage(activeChat.id, {
          phone: currentUserPhone,
          text: normalizedText
        })
        .then(applyMessage)
        .catch(() => {
          applyOutgoingMessage(createLocalOutgoingMessage(activeChat, normalizedText));
        });
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
    activeChat: activeChat ? toCurrentUserChat(activeChat, currentUserPhone) : activeChat,
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
    newChatRecipient,
    realtimeStatus,
    realtimeStatusLabel,
    selectChat,
    selectInstance,
    sendMessage,
    setMessageText,
    setNewChatRecipient,
    visibleChats
  };
}
