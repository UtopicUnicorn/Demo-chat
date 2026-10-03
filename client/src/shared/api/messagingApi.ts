import type { Chat, Message } from "@/shared/types/messaging";

type ApiResponse<TData> = {
  data: TData;
};

export type CreateChatPayload = {
  instanceId: string;
  recipient: string;
  title?: string;
};

async function readApiData<TData>(response: Response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const body = (await response.json()) as ApiResponse<TData>;

  return body.data;
}

export const messagingApi = {
  async checkHealth() {
    const response = await fetch("/health");

    if (!response.ok) {
      throw new Error("Backend health check failed");
    }
  },

  async createChat(payload: CreateChatPayload) {
    const response = await fetch("/api/chats", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    return readApiData<Chat>(response);
  },

  async listChats(instanceId: string) {
    const query = new URLSearchParams({
      instanceId
    });
    const response = await fetch(`/api/chats?${query.toString()}`);

    return readApiData<Chat[]>(response);
  },

  async listMessages(chatId: string) {
    const response = await fetch(`/api/chats/${chatId}/messages`);

    return readApiData<Message[]>(response);
  }
};

export type MessagingApi = typeof messagingApi;
