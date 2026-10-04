import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { PHONE_STORAGE_KEY } from "@/shared/constants";
import AuthWithPhone from "@/widgets/auth/ui/Auth";

function renderAuth() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<AuthWithPhone />} path="/" />
        <Route element={<h1>Чаты</h1>} path="/chats" />
      </Routes>
    </MemoryRouter>
  );
}

describe("AuthWithPhone", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores the normalized phone and redirects to chats", async () => {
    const user = userEvent.setup();

    renderAuth();

    await user.type(screen.getByLabelText("Введите номер телефона"), "+7 (999) 123-45-67");
    await user.click(screen.getByRole("button", { name: "Отправить" }));

    expect(localStorage.getItem(PHONE_STORAGE_KEY)).toBe("+79991234567");
    expect(await screen.findByRole("heading", { name: "Чаты" })).toBeInTheDocument();
  });

  it("keeps submit disabled while the phone is empty", () => {
    renderAuth();

    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });
});
