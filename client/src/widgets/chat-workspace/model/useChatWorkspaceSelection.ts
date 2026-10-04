import { useEffect, useState } from "react";

import { demoInstances } from "@/entities/instance/model/demoInstances";

export function useChatWorkspaceSelection(currentUserPhone: string) {
  const [activeInstanceId, setActiveInstanceId] = useState(demoInstances[0].id);
  const [activeChatId, setActiveChatId] = useState("");
  const [activeChatIdsByInstance, setActiveChatIdsByInstance] = useState<Record<string, string>>(
    {}
  );
  const [conversationOpenByInstance, setConversationOpenByInstance] = useState<
    Record<string, boolean>
  >({});
  const [isConversationOpen, setIsConversationOpen] = useState(false);

  useEffect(() => {
    setActiveChatId("");
    setActiveChatIdsByInstance({});
    setConversationOpenByInstance({});
    setIsConversationOpen(false);
  }, [currentUserPhone]);

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

  function rememberActiveChat(instanceId: string, chatId: string) {
    setActiveChatId(chatId);
    setActiveChatIdsByInstance((currentChatIds) => ({
      ...currentChatIds,
      [instanceId]: chatId
    }));
    setConversationOpenByInstance((currentOpenState) => ({
      ...currentOpenState,
      [instanceId]: true
    }));
    setIsConversationOpen(true);
  }

  return {
    activeChatId,
    activeChatIdsByInstance,
    activeInstanceId,
    closeConversation,
    isConversationOpen,
    rememberActiveChat,
    selectChat,
    selectInstance,
    setActiveChatId
  };
}
