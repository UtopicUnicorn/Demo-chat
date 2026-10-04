import { ChatList } from "@/entities/chat/ui/ChatList";
import { demoInstances } from "@/entities/instance/model/demoInstances";
import { MessageList } from "@/entities/message/ui/MessageList";
import { InstanceTabs } from "@/features/instance-switcher/ui/InstanceTabs";
import { MessageComposer } from "@/features/send-message/ui/MessageComposer";
import { ThemeProvider } from "@/shared/theme/ui/ThemeProvider";
import { AppShell } from "@/shared/ui/app-shell/AppShell";
import {
  useChatWorkspace,
  type UseChatWorkspaceOptions
} from "@/widgets/chat-workspace/model/useChatWorkspace";
import styles from "./ChatWorkspace.module.css";

type ChatWorkspaceProps = UseChatWorkspaceOptions & {
  currentUserPhone: string;
  onLogout: () => void;
};

export function ChatWorkspace({ currentUserPhone, onLogout, ...options }: ChatWorkspaceProps) {
  const {
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
    newChatRecipient,
    realtimeStatus,
    realtimeStatusLabel,
    selectChat,
    selectInstance,
    sendMessage,
    setMessageText,
    setNewChatRecipient,
    visibleChats
  } = useChatWorkspace({
    ...options,
    currentUserPhone
  });

  return (
    <ThemeProvider accent={activeChat?.messenger ?? activeInstance?.type}>
      <AppShell>
        <section className={styles.workspace} aria-label="Демо чат">
          <header className={styles.topBar}>
            <div>
              <h1 className={styles.title}>Демо чат</h1>
              {currentUserPhone ? (
                <p className={styles.currentUser}>Вы вошли как {currentUserPhone}</p>
              ) : null}
            </div>
            <div className={styles.sessionBar}>
              <span className={styles.connectionStatus} data-status={backendStatus}>
                {backendStatusLabel}
              </span>
              <span className={styles.connectionStatus} data-status={realtimeStatus}>
                {realtimeStatusLabel}
              </span>
              <button className={styles.connectionStatus} data-status={"logout"} onClick={onLogout}>
                Выйти
              </button>
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
                <label className={styles.fieldLabel} htmlFor="new-chat-recipient">
                  Номер получателя
                </label>
                <input
                  className={styles.input}
                  id="new-chat-recipient"
                  onChange={(event) => setNewChatRecipient(event.target.value)}
                  placeholder="+79991234567"
                  value={newChatRecipient}
                />
                <button
                  className={styles.newChatButton}
                  disabled={isCreatingChat || !newChatRecipient.trim()}
                  onClick={createChat}
                  type="button"
                >
                  {isCreatingChat ? "Создание..." : "Новый чат"}
                </button>
                {apiError ? <p className={styles.apiError}>{apiError}</p> : null}
              </div>

              <ChatList
                activeChatId={activeChatId}
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
                      onClick={closeConversation}
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
                  <h2>{visibleChats.length > 0 ? "Выберите чат" : "Нет чатов"}</h2>
                </div>
              )}
            </section>
          </section>
        </section>
      </AppShell>
    </ThemeProvider>
  );
}
