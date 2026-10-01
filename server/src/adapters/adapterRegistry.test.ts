import { getMessengerAdapter } from "./adapterRegistry.js";

describe("adapterRegistry", () => {
  it.each(["max", "telegram", "whatsapp"] as const)("returns %s adapter", (type) => {
    expect(getMessengerAdapter(type)).toEqual(expect.objectContaining({ type }));
  });
});
