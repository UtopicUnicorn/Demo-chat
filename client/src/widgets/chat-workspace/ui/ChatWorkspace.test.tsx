import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "@jest/globals";

import { ChatWorkspace } from "@/widgets/chat-workspace/ui/ChatWorkspace";

describe("ChatWorkspace", () => {
  it("switches chats when the messenger instance changes", async () => {
    const user = userEvent.setup();

    render(<ChatWorkspace />);

    expect(screen.getByRole("heading", { name: "Анна Иванова" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Telegram" }));

    expect(screen.getByRole("heading", { name: "Demo Team" })).toBeInTheDocument();
    expect(screen.getByText("Telegram - @demo_team")).toBeInTheDocument();
  });

  it("sends only the outgoing message from the composer", async () => {
    const user = userEvent.setup();

    render(<ChatWorkspace />);

    await user.type(screen.getByLabelText("Текст сообщения"), "Ручной ответ");
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    const conversation = screen.getByRole("region", { name: "Переписка" });

    expect(within(conversation).getByText("Ручной ответ")).toBeInTheDocument();
    expect(within(conversation).queryByText(/received: Ручной ответ/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Текст сообщения")).toHaveValue("");
  });

  it("does not send an empty message", () => {
    render(<ChatWorkspace />);

    const conversation = screen.getByRole("region", { name: "Переписка" });

    fireEvent.submit(screen.getByLabelText("Текст сообщения").closest("form")!);

    expect(within(conversation).queryByText(/local-/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });

  it("creates a new chat for the active messenger instance", async () => {
    const user = userEvent.setup();

    render(<ChatWorkspace />);

    await user.click(screen.getByRole("button", { name: "Новый чат" }));

    expect(screen.getByRole("heading", { name: "Новый чат" })).toBeInTheDocument();
    expect(screen.getByText("MAX - demo-chat-2")).toBeInTheDocument();
  });

  it("opens selected chat and returns to chat list state", async () => {
    const user = userEvent.setup();

    render(<ChatWorkspace />);

    await user.click(screen.getByRole("button", { name: /Анна Иванова/i }));

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
    const { container } = render(<ChatWorkspace />);

    expect(container.querySelector("main")?.getAttribute("data-accent")).toBe("max");

    await user.click(screen.getByRole("button", { name: "WhatsApp" }));

    expect(container.querySelector("main")?.getAttribute("data-accent")).toBe("whatsapp");
  });
});
