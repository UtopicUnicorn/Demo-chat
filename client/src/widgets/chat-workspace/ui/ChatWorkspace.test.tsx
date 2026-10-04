import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ComponentProps } from "react";

import type { Chat, Message } from "@/shared/types/messaging";
import {
  createApiMock,
  createRealtimeFactoryMock
} from "@/widgets/chat-workspace/model/chatWorkspaceTestUtils";
import { ChatWorkspace } from "@/widgets/chat-workspace/ui/ChatWorkspace";

const currentUserPhone = "+70000000000";

function renderChatWorkspace(props: Partial<ComponentProps<typeof ChatWorkspace>> = {}) {
  return render(
    <ChatWorkspace
      api={createApiMock()}
      currentUserPhone={currentUserPhone}
      onLogout={jest.fn()}
      {...props}
    />
  );
}

describe("ChatWorkspace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("switches chats when the messenger instance changes", async () => {
    const user = userEvent.setup();

    renderChatWorkspace();

    expect(await screen.findByRole("button", { name: /\+7 999 123-45-67/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Telegram" }));

    expect(await screen.findByRole("button", { name: /@demo_team/i })).toBeInTheDocument();
  });

  it("sends only the outgoing message from the composer", async () => {
    const user = userEvent.setup();
    const { realtimeFactory } = createRealtimeFactoryMock();

    renderChatWorkspace({ realtimeFactory });

    await user.click(await screen.findByRole("button", { name: /\+7 999 123-45-67/i }));

    await user.type(screen.getByLabelText("Текст сообщения"), "Ручной ответ");
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    await screen.findByRole("heading", { name: "+7 999 123-45-67" });

    const conversation = screen.getByRole("region", { name: "Переписка" });

    expect(within(conversation).getByText("Ручной ответ")).toBeInTheDocument();
    expect(within(conversation).queryByText(/received: Ручной ответ/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Текст сообщения")).toHaveValue("");
  });

  it("does not send an empty message", async () => {
    const user = userEvent.setup();
    const { realtimeFactory } = createRealtimeFactoryMock();

    renderChatWorkspace({ realtimeFactory });

    await user.click(await screen.findByRole("button", { name: /\+7 999 123-45-67/i }));

    const conversation = screen.getByRole("region", { name: "Переписка" });

    fireEvent.submit(screen.getByLabelText("Текст сообщения").closest("form")!);

    expect(within(conversation).queryByText(/local-/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });

  it("creates a new chat for the active messenger instance", async () => {
    const user = userEvent.setup();
    const api = createApiMock();
    const { realtimeFactory } = createRealtimeFactoryMock();

    renderChatWorkspace({ api, realtimeFactory });

    await screen.findByRole("button", { name: /\+7 999 123-45-67/i });

    await user.type(screen.getByLabelText("Номер получателя"), "+79991234567");
    await user.click(screen.getByRole("button", { name: "Новый чат" }));

    await waitFor(() => expect(api.createChat).toHaveBeenCalledTimes(1));
    expect(api.createChat).toHaveBeenCalledWith({
      instanceId: "max-main",
      phone: currentUserPhone,
      recipient: "+79991234567"
    });
    expect(screen.getByRole("heading", { name: "+79991234567" })).toBeInTheDocument();
    expect(screen.getByText("MAX - +79991234567")).toBeInTheDocument();
  });

  it("opens selected chat and returns to chat list state", async () => {
    const user = userEvent.setup();
    const { realtimeFactory } = createRealtimeFactoryMock();

    renderChatWorkspace({ realtimeFactory });

    await user.click(await screen.findByRole("button", { name: /\+7 999 123-45-67/i }));

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
    const { container } = renderChatWorkspace();

    await screen.findByRole("button", { name: /\+7 999 123-45-67/i });

    expect(container.querySelector("main")?.getAttribute("data-accent")).toBe("max");

    await user.click(screen.getByRole("button", { name: "WhatsApp" }));

    expect(container.querySelector("main")?.getAttribute("data-accent")).toBe("whatsapp");
  });

  it("shows backend availability from health check", async () => {
    renderChatWorkspace();

    expect(await screen.findByText("Бэкенд доступен")).toBeInTheDocument();
  });

  it("loads chats on start and messages only after opening a chat", async () => {
    const user = userEvent.setup();
    const api = createApiMock();
    const { realtimeFactory } = createRealtimeFactoryMock();

    renderChatWorkspace({ api, realtimeFactory });

    const firstChatButton = await screen.findByRole("button", { name: /\+7 999 123-45-67/i });

    expect(firstChatButton).toHaveAttribute("data-active", "false");
    expect(screen.getByRole("heading", { name: "Выберите чат" })).toBeInTheDocument();
    expect(api.listChats).toHaveBeenCalledWith("max-main", currentUserPhone);
    expect(api.listMessages).not.toHaveBeenCalled();

    await user.click(firstChatButton);

    await waitFor(() =>
      expect(api.listMessages).toHaveBeenCalledWith("max-alex", currentUserPhone)
    );
  });

  it("does not repeat health, chats, or messages requests while switching cached instances", async () => {
    const user = userEvent.setup();
    const api = createApiMock();

    renderChatWorkspace({ api });

    await screen.findByRole("button", { name: /\+7 999 123-45-67/i });
    expect(api.checkHealth).toHaveBeenCalledTimes(1);
    expect(api.listChats).toHaveBeenCalledTimes(1);
    expect(api.listMessages).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Telegram" }));
    const telegramChatButton = await screen.findByRole("button", { name: /@demo_team/i });
    expect(telegramChatButton).toHaveAttribute("data-active", "false");

    await user.click(screen.getByRole("button", { name: "MAX" }));
    const maxChatButton = await screen.findByRole("button", { name: /\+7 999 123-45-67/i });
    expect(maxChatButton).toHaveAttribute("data-active", "false");

    expect(api.checkHealth).toHaveBeenCalledTimes(1);
    expect(api.listChats).toHaveBeenCalledTimes(2);
    expect(api.listChats).toHaveBeenNthCalledWith(1, "max-main", currentUserPhone);
    expect(api.listChats).toHaveBeenNthCalledWith(2, "telegram-main", currentUserPhone);
    expect(api.listMessages).not.toHaveBeenCalled();
  });

  it("restores the websocket connection for the previously opened chat when returning to an instance", async () => {
    const user = userEvent.setup();
    const { connection, realtimeFactory } = createRealtimeFactoryMock();

    renderChatWorkspace({ realtimeFactory });

    await user.click(await screen.findByRole("button", { name: /\+7 999 123-45-67/i }));
    await waitFor(() => expect(realtimeFactory).toHaveBeenCalledTimes(1));
    expect(realtimeFactory).toHaveBeenLastCalledWith(
      expect.objectContaining({ chatId: "max-alex" })
    );

    await user.click(screen.getByRole("button", { name: "Telegram" }));
    expect(await screen.findByRole("button", { name: /@demo_team/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /@demo_team/i }));
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

    renderChatWorkspace({ realtimeFactory });

    await user.click(await screen.findByRole("button", { name: /\+7 999 123-45-67/i }));
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
      senderPhone: "+7 999 123-45-67",
      status: "delivered",
      text: "Ответ от сервера"
    };
    const updatedChat: Chat = {
      createdAt: "2026-10-02T06:00:00.000Z",
      id: "max-alex",
      instanceId: "max-main",
      lastMessage: incomingMessage,
      messenger: "max",
      ownerPhone: currentUserPhone,
      participantPhones: [currentUserPhone, "+7 999 123-45-67"],
      recipient: "+7 999 123-45-67",
      title: "+7 999 123-45-67",
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
