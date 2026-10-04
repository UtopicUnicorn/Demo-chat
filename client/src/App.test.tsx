import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { App } from "@/App";
import { demoChats } from "@/entities/chat/model/demoChats";
import { demoMessages } from "@/entities/message/model/demoMessages";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = jest.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);

      if (url.startsWith("/api/chats/")) {
        return {
          json: async () => ({
            data: demoMessages.filter((message) => message.chatId === "max-alex")
          }),
          ok: true
        } as Response;
      }

      if (url.startsWith("/api/chats?")) {
        return {
          json: async () => ({
            data: demoChats.filter((chat) => chat.instanceId === "max-main")
          }),
          ok: true
        } as Response;
      }

      return {
        ok: true
      } as Response;
    });
  });

  it("renders the login page at the auth route", async () => {
    window.history.pushState({}, "", "/auth");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Вход в чат" })).toBeInTheDocument();
  });
});
