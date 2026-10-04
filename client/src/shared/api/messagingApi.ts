import type { Chat, Message } from "@/shared/types/messaging";

type ApiResponse<TData> = {
  data: TData;
};

export type CreateChatPayload = {
  instanceId: string;
  phone: string;
  recipient: string;
  title?: string;
};

export type CreateMessagePayload = {
  phone: string;
  text: string;
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

  async listChats(instanceId: string, phone: string) {
    const query = new URLSearchParams({
      instanceId,
      phone
    });
    const response = await fetch(`/api/chats?${query.toString()}`);

    return readApiData<Chat[]>(response);
  },

  async listMessages(chatId: string, phone: string) {
    const query = new URLSearchParams({
      phone
    });
    const response = await fetch(`/api/chats/${chatId}/messages?${query.toString()}`);

    return readApiData<Message[]>(response);
  },

  async sendMessage(chatId: string, payload: CreateMessagePayload) {
    const response = await fetch(`/api/chats/${chatId}/messages`, {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    return readApiData<Message>(response);
  }
};

export type MessagingApi = typeof messagingApi;
