import { useMemo, useState } from "react";

import { demoChats } from "@/entities/chat/model/demoChats";
import { ChatList } from "@/entities/chat/ui/ChatList";
import { demoInstances } from "@/entities/instance/model/demoInstances";
import { demoMessages } from "@/entities/message/model/demoMessages";
import { MessageList } from "@/entities/message/ui/MessageList";
import { InstanceTabs } from "@/features/instance-switcher/ui/InstanceTabs";
import { MessageComposer } from "@/features/send-message/ui/MessageComposer";
import { ThemeProvider } from "@/shared/theme/ui/ThemeProvider";
import { AppShell } from "@/shared/ui/app-shell/AppShell";
import type { Chat, Message } from "@/shared/types/messaging";
import styles from "./ChatWorkspace.module.css";

export function ChatWorkspace() {
  const [chats, setChats] = useState<Chat[]>(demoChats);
  const [activeInstanceId, setActiveInstanceId] = useState(demoInstances[0].id);
  const [activeChatId, setActiveChatId] = useState(demoChats[0].id);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>(demoMessages);

  const visibleChats = useMemo(
    () => chats.filter((chat) => chat.instanceId === activeInstanceId),
    [activeInstanceId, chats]
  );
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? visibleChats[0];
  const activeInstance = demoInstances.find((instance) => instance.id === activeInstanceId);
  const activeMessages = messages.filter((message) => message.chatId === activeChat?.id);

  function selectInstance(instanceId: string) {
    setActiveInstanceId(instanceId);
    setActiveChatId(chats.find((chat) => chat.instanceId === instanceId)?.id ?? "");
    setIsConversationOpen(false);
  }

  function selectChat(chatId: string) {
    setActiveChatId(chatId);
    setIsConversationOpen(true);
  }

  function createChat() {
    if (!activeInstance) {
      return;
    }

    const timestamp = new Date().toISOString();
    const chatNumber = visibleChats.length + 1;
    const recipient = `demo-chat-${chatNumber}`;
    const createdChat: Chat = {
      createdAt: timestamp,
      id: `${activeInstance.id}-${Date.now()}`,
      instanceId: activeInstance.id,
      lastMessage: null,
      messenger: activeInstance.type,
      recipient,
      title: "Новый чат",
      updatedAt: timestamp
    };

    setChats((currentChats) => [createdChat, ...currentChats]);
    setActiveChatId(createdChat.id);
    setIsConversationOpen(true);
  }

  function sendMessage() {
    const normalizedText = messageText.trim();

    if (!normalizedText || !activeChat) {
      return;
    }

    const createdAt = new Date().toISOString();
    const outgoingMessage: Message = {
      chatId: activeChat.id,
      createdAt,
      direction: "outgoing",
      id: `local-${Date.now()}`,
      instanceId: activeChat.instanceId,
      messenger: activeChat.messenger,
      providerChatId: activeChat.recipient,
      providerMessageId: `local-provider-${Date.now()}`,
      status: "sent",
      text: normalizedText
    };

    setMessages((currentMessages) => [...currentMessages, outgoingMessage]);
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              lastMessage: outgoingMessage,
              updatedAt: createdAt
            }
          : chat
      )
    );
    setMessageText("");
  }

  return (
    <ThemeProvider accent={activeChat?.messenger ?? activeInstance?.type}>
      <AppShell>
        <section className={styles.workspace} aria-label="Демо чат">
          <header className={styles.topBar}>
            <div>
              <h1 className={styles.title}>Демо чат</h1>
            </div>
            <div className={styles.sessionBar}>
              <span className={styles.connectionStatus}>Онлайн</span>
            </div>
          </header>

          <InstanceTabs
            activeInstanceId={activeInstanceId}
            instances={demoInstances}
            onSelectInstance={selectInstance}
          />

          <section
            className={styles.content}
            data-view={isConversationOpen ? "conversation" : "chats"}
          >
            <div className={styles.chatPanel}>
              <div className={styles.newChatBar}>
                <button className={styles.newChatButton} onClick={createChat} type="button">
                  Новый чат
                </button>
              </div>

              <ChatList
                activeChatId={activeChat?.id}
                chats={visibleChats}
                messages={messages}
                onSelectChat={selectChat}
              />
            </div>

            <section className={styles.conversation} aria-label="Переписка">
              {activeChat ? (
                <>
                  <header className={styles.conversationHeader}>
                    <button
                      aria-label="Назад к чатам"
                      className={styles.backButton}
                      onClick={() => setIsConversationOpen(false)}
                      type="button"
                    >
                      <span aria-hidden="true">←</span>
                    </button>
                    <span className={styles.avatar} aria-hidden="true">
                      {activeChat.title.slice(0, 1)}
                    </span>
                    <div>
                      <h2 className={styles.conversationTitle}>{activeChat.title}</h2>
                      <p
                        className={styles.conversationMeta}
                      >{`${activeInstance?.label ?? "Мессенджер"} - ${activeChat.recipient}`}</p>
                    </div>
                  </header>

                  <MessageList messages={activeMessages} />

                  <MessageComposer
                    messageText={messageText}
                    onChangeMessageText={setMessageText}
                    onSendMessage={sendMessage}
                  />
                </>
              ) : (
                <div className={styles.emptyState}>
                  <h2>Нет чатов</h2>
                </div>
              )}
            </section>
          </section>
        </section>
      </AppShell>
    </ThemeProvider>
  );
}
