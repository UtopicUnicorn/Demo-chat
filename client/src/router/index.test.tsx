import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { demoChats } from "@/entities/chat/model/demoChats";
import { demoMessages } from "@/entities/message/model/demoMessages";
import { AuthRoute, ChatRoute } from "@/router";
import { PHONE_STORAGE_KEY } from "@/shared/constants";

function renderRouter(initialEntry: string) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ChatRoute />} path="/" />
        <Route element={<AuthRoute />} path="/auth" />
      </Routes>
    </MemoryRouter>
  );
}

describe("router auth protection", () => {
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

  it("redirects / to the auth page without a stored phone", async () => {
    renderRouter("/");

    expect(await screen.findByRole("heading", { name: "Вход в чат" })).toBeInTheDocument();
  });

  it("redirects /auth to protected chats when a phone is already stored", async () => {
    localStorage.setItem(PHONE_STORAGE_KEY, "+70000000000");

    renderRouter("/auth");

    expect(await screen.findByText("Вы вошли как +70000000000")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Вход в чат" })).not.toBeInTheDocument();
  });

  it("opens protected chats with a stored phone and clears it on logout", async () => {
    const user = userEvent.setup();
    localStorage.setItem(PHONE_STORAGE_KEY, "+70000000000");

    renderRouter("/");

    expect(await screen.findByText("Вы вошли как +70000000000")).toBeInTheDocument();
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "Выйти" }));

    expect(localStorage.getItem(PHONE_STORAGE_KEY)).toBeNull();
    expect(await screen.findByRole("heading", { name: "Вход в чат" })).toBeInTheDocument();
  });
});
