import { getTimeLabel } from "@/shared/lib/getTimeLabel";
import type { Message } from "@/shared/types/messaging";
import styles from "./MessageList.module.css";

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className={styles.messageList} aria-live="polite">
      {messages.map((message) => (
        <article
          className={styles.messageBubble}
          data-direction={message.direction}
          key={message.id}
        >
          <p className={styles.messageText}>{message.text}</p>
          <time className={styles.messageTime} dateTime={message.createdAt}>
            {getTimeLabel(message.createdAt)}
          </time>
        </article>
      ))}
    </div>
  );
}
