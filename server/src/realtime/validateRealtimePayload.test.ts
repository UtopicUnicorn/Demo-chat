import {
  parseChatJoinPayload,
  parseInstanceJoinPayload,
  parseMessageCommandPayload
} from "./validateRealtimePayload.js";

describe("realtime payload validators", () => {
  it("parses chat join payloads", () => {
    expect(parseChatJoinPayload({ chatId: "  chat-id  " })).toEqual({
      chatId: "chat-id"
    });
  });

  it("rejects invalid chat join payloads", () => {
    expect(parseChatJoinPayload(undefined)).toBeNull();
    expect(parseChatJoinPayload({ chatId: " " })).toBeNull();
    expect(parseChatJoinPayload([])).toBeNull();
  });

  it("parses instance join payloads", () => {
    expect(parseInstanceJoinPayload({ instanceId: "  max-main  " })).toEqual({
      instanceId: "max-main"
    });
  });

  it("rejects invalid instance join payloads", () => {
    expect(parseInstanceJoinPayload(undefined)).toBeNull();
    expect(parseInstanceJoinPayload({ instanceId: " " })).toBeNull();
    expect(parseInstanceJoinPayload("max-main")).toBeNull();
  });

  it("parses message command payloads", () => {
    expect(parseMessageCommandPayload({ chatId: "  chat-id  ", text: "  Hello  " })).toEqual({
      chatId: "chat-id",
      text: "Hello"
    });
  });

  it("rejects invalid message command payloads", () => {
    expect(parseMessageCommandPayload(undefined)).toBeNull();
    expect(parseMessageCommandPayload({ chatId: "chat-id", text: " " })).toBeNull();
    expect(parseMessageCommandPayload({ chatId: " ", text: "Hello" })).toBeNull();
  });
});
