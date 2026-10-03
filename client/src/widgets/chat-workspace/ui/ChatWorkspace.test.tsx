import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import type { Chat, Message } from "@/shared/types/messaging";
import {
  createApiMock,
  createRealtimeFactoryMock
} from "@/widgets/chat-workspace/model/chatWorkspaceTestUtils";
import { ChatWorkspace } from "@/widgets/chat-workspace/ui/ChatWorkspace";

describe("ChatWorkspace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("switches chats when the messenger instance changes", async () => {
    const user = userEvent.setup();

    render(<ChatWorkspace api={createApiMock()} />);

    expect(await screen.findByRole("button", { name: /Анна Иванова/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Telegram" }));

    expect(await screen.findByRole("button", { name: /Demo Team/i })).toBeInTheDocument();
  });

  it("sends only the outgoing message from the composer", async () => {
    const user = userEvent.setup();
    const { realtimeFactory } = createRealtimeFactoryMock();

    render(<ChatWorkspace api={createApiMock()} realtimeFactory={realtimeFactory} />);

    await user.click(await screen.findByRole("button", { name: /Анна Иванова/i }));

    await user.type(screen.getByLabelText("Текст сообщения"), "Ручной ответ");
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    await screen.findByRole("heading", { name: "Анна Иванова" });

    const conversation = screen.getByRole("region", { name: "Переписка" });

    expect(within(conversation).getByText("Ручной ответ")).toBeInTheDocument();
    expect(within(conversation).queryByText(/received: Ручной ответ/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Текст сообщения")).toHaveValue("");
  });

  it("does not send an empty message", async () => {
    const user = userEvent.setup();
    const { realtimeFactory } = createRealtimeFactoryMock();

    render(<ChatWorkspace api={createApiMock()} realtimeFactory={realtimeFactory} />);

    await user.click(await screen.findByRole("button", { name: /Анна Иванова/i }));

    const conversation = screen.getByRole("region", { name: "Переписка" });

    fireEvent.submit(screen.getByLabelText("Текст сообщения").closest("form")!);

    expect(within(conversation).queryByText(/local-/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });

  it("creates a new chat for the active messenger instance", async () => {
    const user = userEvent.setup();
    const api = createApiMock();
    const { realtimeFactory } = createRealtimeFactoryMock();

    render(<ChatWorkspace api={api} realtimeFactory={realtimeFactory} />);

    await screen.findByRole("button", { name: /Анна Иванова/i });

    await user.click(screen.getByRole("button", { name: "Новый чат" }));

    await waitFor(() => expect(api.createChat).toHaveBeenCalledTimes(1));
    expect(api.createChat).toHaveBeenCalledWith({
      instanceId: "max-main",
      recipient: "demo-chat-2",
      title: "Новый чат"
    });
    expect(screen.getByRole("heading", { name: "Новый чат" })).toBeInTheDocument();
    expect(screen.getByText("MAX - demo-chat-2")).toBeInTheDocument();
  });

  it("opens selected chat and returns to chat list state", async () => {
    const user = userEvent.setup();
    const { realtimeFactory } = createRealtimeFactoryMock();

    render(<ChatWorkspace api={createApiMock()} realtimeFactory={realtimeFactory} />);

    await user.click(await screen.findByRole("button", { name: /Анна Иванова/i }));

    await waitFor(() => expect(realtimeFactory).toHaveBeenCalledTimes(1));
    expect(realtimeFactory).toHaveBeenCalledWith(expect.objectContaining({ chatId: "max-alex" }));
    expect(screen.getByRole("region", { name: "Переписка" }).parentElement).toHaveAttribute(
      "data-view",
      "conversation"
    );

    await user.click(screen.getByRole("button", { name: "Назад к чатам" }));

    expect(screen.getByRole("region", { name: "Переписка" }).parentElement).toHaveAttribute(
      "data-view",
      "chats"
    );
  });

  it("updates theme accent from the selected chat", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChatWorkspace api={createApiMock()} />);

    await screen.findByRole("button", { name: /Анна Иванова/i });

    expect(container.querySelector("main")?.getAttribute("data-accent")).toBe("max");

    await user.click(screen.getByRole("button", { name: "WhatsApp" }));

    expect(container.querySelector("main")?.getAttribute("data-accent")).toBe("whatsapp");
  });

  it("shows backend availability from health check", async () => {
    render(<ChatWorkspace api={createApiMock()} />);

    expect(await screen.findByText("Бэкенд доступен")).toBeInTheDocument();
  });

  it("loads chats on start and messages only after opening a chat", async () => {
    const user = userEvent.setup();
    const api = createApiMock();
    const { realtimeFactory } = createRealtimeFactoryMock();

    render(<ChatWorkspace api={api} realtimeFactory={realtimeFactory} />);

    const firstChatButton = await screen.findByRole("button", { name: /Анна Иванова/i });

    expect(firstChatButton).toHaveAttribute("data-active", "false");
    expect(screen.getByRole("heading", { name: "Выберите чат" })).toBeInTheDocument();
    expect(api.listChats).toHaveBeenCalledWith("max-main");
    expect(api.listMessages).not.toHaveBeenCalled();

    await user.click(firstChatButton);

    await waitFor(() => expect(api.listMessages).toHaveBeenCalledWith("max-alex"));
  });

  it("does not repeat health, chats, or messages requests while switching cached instances", async () => {
    const user = userEvent.setup();
    const api = createApiMock();

    render(<ChatWorkspace api={api} />);

    await screen.findByRole("button", { name: /Анна Иванова/i });
    expect(api.checkHealth).toHaveBeenCalledTimes(1);
    expect(api.listChats).toHaveBeenCalledTimes(1);
    expect(api.listMessages).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Telegram" }));
    const telegramChatButton = await screen.findByRole("button", { name: /Demo Team/i });
    expect(telegramChatButton).toHaveAttribute("data-active", "false");

    await user.click(screen.getByRole("button", { name: "MAX" }));
    const maxChatButton = await screen.findByRole("button", { name: /Анна Иванова/i });
    expect(maxChatButton).toHaveAttribute("data-active", "false");

    expect(api.checkHealth).toHaveBeenCalledTimes(1);
    expect(api.listChats).toHaveBeenCalledTimes(2);
    expect(api.listChats).toHaveBeenNthCalledWith(1, "max-main");
    expect(api.listChats).toHaveBeenNthCalledWith(2, "telegram-main");
    expect(api.listMessages).not.toHaveBeenCalled();
  });

  it("restores the websocket connection for the previously opened chat when returning to an instance", async () => {
    const user = userEvent.setup();
    const { connection, realtimeFactory } = createRealtimeFactoryMock();

    render(<ChatWorkspace api={createApiMock()} realtimeFactory={realtimeFactory} />);

    await user.click(await screen.findByRole("button", { name: /Анна Иванова/i }));
    await waitFor(() => expect(realtimeFactory).toHaveBeenCalledTimes(1));
    expect(realtimeFactory).toHaveBeenLastCalledWith(
      expect.objectContaining({ chatId: "max-alex" })
    );

    await user.click(screen.getByRole("button", { name: "Telegram" }));
    expect(await screen.findByRole("button", { name: /Demo Team/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Demo Team/i }));
    await waitFor(() => expect(realtimeFactory).toHaveBeenCalledTimes(2));
    expect(realtimeFactory).toHaveBeenLastCalledWith(
      expect.objectContaining({ chatId: "telegram-team" })
    );

    await user.click(screen.getByRole("button", { name: "MAX" }));

    await waitFor(() => expect(realtimeFactory).toHaveBeenCalledTimes(3));
    expect(realtimeFactory).toHaveBeenLastCalledWith(
      expect.objectContaining({ chatId: "max-alex" })
    );
    expect(connection.disconnect).toHaveBeenCalled();
  });

  it("applies incoming websocket messages to the opened chat", async () => {
    const user = userEvent.setup();
    const { connections, realtimeFactory } = createRealtimeFactoryMock();

    render(<ChatWorkspace api={createApiMock()} realtimeFactory={realtimeFactory} />);

    await user.click(await screen.findByRole("button", { name: /Анна Иванова/i }));
    await waitFor(() => expect(connections).toHaveLength(1));

    const incomingMessage: Message = {
      chatId: "max-alex",
      createdAt: "2026-10-03T10:01:00.000Z",
      direction: "incoming",
      id: "server-message-1",
      instanceId: "max-main",
      messenger: "max",
      providerChatId: "+7 999 123-45-67",
      providerMessageId: "server-provider-message-1",
      status: "delivered",
      text: "Ответ от сервера"
    };
    const updatedChat: Chat = {
      createdAt: "2026-10-02T06:00:00.000Z",
      id: "max-alex",
      instanceId: "max-main",
      lastMessage: incomingMessage,
      messenger: "max",
      recipient: "+7 999 123-45-67",
      title: "Анна Иванова",
      updatedAt: incomingMessage.createdAt
    };

    act(() => {
      connections[0].onMessageCreated({
        chat: updatedChat,
        message: incomingMessage
      });
    });

    expect(
      await within(screen.getByRole("region", { name: "Переписка" })).findByText("Ответ от сервера")
    ).toBeInTheDocument();
  });
});
