import { useEffect, useRef, useState } from "react";

import {
  type ChatRealtimeConnection,
  type ChatRealtimeOptions,
  openChatRealtime,
  type RealtimeStatus
} from "@/shared/api/realtimeClient";
import type { Chat, Message } from "@/shared/types/messaging";

type UseChatRealtimeSubscriptionOptions = {
  activeChatId?: string;
  currentUserPhone: string;
  isConversationOpen: boolean;
  onChatUpdated: (chat: Chat) => void;
  onMessageCreated: (payload: { chat: Chat; message: Message }) => void;
  realtimeFactory?: (options: ChatRealtimeOptions) => ChatRealtimeConnection;
};

export function useChatRealtimeSubscription({
  activeChatId,
  currentUserPhone,
  isConversationOpen,
  onChatUpdated,
  onMessageCreated,
  realtimeFactory = openChatRealtime
}: UseChatRealtimeSubscriptionOptions) {
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("idle");
  const realtimeConnectionRef = useRef<ChatRealtimeConnection | null>(null);

  useEffect(() => {
    realtimeConnectionRef.current?.disconnect();
    realtimeConnectionRef.current = null;
    setRealtimeStatus("idle");

    if (!activeChatId || !currentUserPhone || !isConversationOpen) {
      return;
    }

    const connection = realtimeFactory({
      chatId: activeChatId,
      onChatUpdated,
      onMessageCreated,
      onStatusChange: setRealtimeStatus,
      phone: currentUserPhone
    });

    realtimeConnectionRef.current = connection;

    return () => {
      connection.disconnect();

      if (realtimeConnectionRef.current === connection) {
        realtimeConnectionRef.current = null;
      }
    };
  }, [
    activeChatId,
    currentUserPhone,
    isConversationOpen,
    onChatUpdated,
    onMessageCreated,
    realtimeFactory
  ]);

  return {
    realtimeStatus
  };
}
