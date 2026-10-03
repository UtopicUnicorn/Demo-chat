import { FormEvent } from "react";

import styles from "./MessageComposer.module.css";

type MessageComposerProps = {
  messageText: string;
  onChangeMessageText(value: string): void;
  onSendMessage(): void;
};

export function MessageComposer({
  messageText,
  onChangeMessageText,
  onSendMessage
}: MessageComposerProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSendMessage();
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <input
        aria-label="Текст сообщения"
        className={styles.input}
        onChange={(event) => onChangeMessageText(event.target.value)}
        placeholder="Введите сообщение"
        value={messageText}
      />
      <button className={styles.button} disabled={!messageText.trim()} type="submit">
        Отправить
      </button>
    </form>
  );
}
