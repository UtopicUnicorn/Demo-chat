import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "@jest/globals";

import { App } from "@/App";

describe("App", () => {
  it("renders the chat workspace", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Демо чат" })).toBeInTheDocument();
  });
});
