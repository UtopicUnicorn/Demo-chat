import { chatRoom, instanceRoom } from "./rooms.js";

describe("realtime rooms", () => {
  it("creates stable chat room names", () => {
    expect(chatRoom("chat-id")).toBe("chat:chat-id");
  });

  it("creates stable instance room names", () => {
    expect(instanceRoom("max-main")).toBe("instance:max-main");
  });
});
