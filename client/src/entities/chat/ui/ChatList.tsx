import type { Chat, Message } from "@/shared/types/messaging";
import styles from "./ChatList.module.css";

type ChatListProps = {
  activeChatId?: string;
  chats: Chat[];
  messages: Message[];
  onSelectChat(chatId: string): void;
};

export function ChatList({ activeChatId, chats, messages, onSelectChat }: ChatListProps) {
  return (
    <aside className={styles.chatList} aria-label="Чаты">
      {chats.map((chat) => {
        const lastMessage = [...messages].reverse().find((message) => message.chatId === chat.id);

        return (
          <button
            className={styles.chatListItem}
            data-active={chat.id === activeChatId}
            data-accent={chat.messenger}
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            type="button"
          >
            <span className={styles.avatar} aria-hidden="true">
              {chat.title.slice(0, 1)}
            </span>
            <span className={styles.chatMeta}>
              <span className={styles.chatTitle}>{chat.title}</span>
              <span className={styles.chatPreview}>{lastMessage?.text ?? chat.recipient}</span>
            </span>
          </button>
        );
      })}
    </aside>
  );
}
