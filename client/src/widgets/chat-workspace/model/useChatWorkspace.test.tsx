import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  createApiMock,
  createRealtimeFactoryMock
} from "@/widgets/chat-workspace/model/chatWorkspaceTestUtils";
import { useChatWorkspace } from "@/widgets/chat-workspace/model/useChatWorkspace";

describe("useChatWorkspace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checks health once and caches chats per messenger instance", async () => {
    const api = createApiMock();
    const { result } = renderHook(() => useChatWorkspace({ api }));

    await waitFor(() => expect(result.current.visibleChats).toHaveLength(1));

    expect(api.checkHealth).toHaveBeenCalledTimes(1);
    expect(api.listChats).toHaveBeenCalledTimes(1);
    expect(api.listChats).toHaveBeenNthCalledWith(1, "max-main");
    expect(api.listMessages).not.toHaveBeenCalled();
    expect(result.current.activeChat).toBeUndefined();

    act(() => result.current.selectInstance("telegram-main"));
    await waitFor(() => expect(result.current.visibleChats[0]?.id).toBe("telegram-team"));

    act(() => result.current.selectInstance("max-main"));
    await waitFor(() => expect(result.current.visibleChats[0]?.id).toBe("max-alex"));

    expect(api.checkHealth).toHaveBeenCalledTimes(1);
    expect(api.listChats).toHaveBeenCalledTimes(2);
    expect(api.listChats).toHaveBeenNthCalledWith(2, "telegram-main");
    expect(api.listMessages).not.toHaveBeenCalled();
  });

  it("loads messages only after selecting a chat and does not reload cached messages", async () => {
    const api = createApiMock();
    const { realtimeFactory } = createRealtimeFactoryMock();
    const { result } = renderHook(() => useChatWorkspace({ api, realtimeFactory }));

    await waitFor(() => expect(result.current.visibleChats[0]?.id).toBe("max-alex"));
    expect(api.listMessages).not.toHaveBeenCalled();

    act(() => result.current.selectChat("max-alex"));

    await waitFor(() =>
      expect(result.current.activeMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ chatId: "max-alex" })])
      )
    );
    expect(api.listMessages).toHaveBeenCalledWith("max-alex");

    act(() => result.current.closeConversation());
    act(() => result.current.selectChat("max-alex"));

    expect(api.listMessages).toHaveBeenCalledTimes(1);
  });

  it("restores the websocket connection for a previously opened instance chat", async () => {
    const api = createApiMock();
    const { connection, realtimeFactory } = createRealtimeFactoryMock();
    const { result } = renderHook(() => useChatWorkspace({ api, realtimeFactory }));

    await waitFor(() => expect(result.current.visibleChats[0]?.id).toBe("max-alex"));

    act(() => result.current.selectChat("max-alex"));
    await waitFor(() => expect(realtimeFactory).toHaveBeenCalledTimes(1));
    expect(realtimeFactory).toHaveBeenLastCalledWith(
      expect.objectContaining({ chatId: "max-alex" })
    );

    act(() => result.current.selectInstance("telegram-main"));
    await waitFor(() => expect(result.current.visibleChats[0]?.id).toBe("telegram-team"));

    act(() => result.current.selectChat("telegram-team"));
    await waitFor(() => expect(realtimeFactory).toHaveBeenCalledTimes(2));
    expect(realtimeFactory).toHaveBeenLastCalledWith(
      expect.objectContaining({ chatId: "telegram-team" })
    );

    act(() => result.current.selectInstance("max-main"));

    await waitFor(() => expect(realtimeFactory).toHaveBeenCalledTimes(3));
    expect(realtimeFactory).toHaveBeenLastCalledWith(
      expect.objectContaining({ chatId: "max-alex" })
    );
    expect(connection.disconnect).toHaveBeenCalled();
  });

  it("creates a chat for the active instance and opens it", async () => {
    const api = createApiMock();
    const { realtimeFactory } = createRealtimeFactoryMock();
    const { result } = renderHook(() => useChatWorkspace({ api, realtimeFactory }));

    await waitFor(() => expect(result.current.visibleChats[0]?.id).toBe("max-alex"));

    await act(async () => {
      await result.current.createChat();
    });

    expect(api.createChat).toHaveBeenCalledWith({
      instanceId: "max-main",
      recipient: "demo-chat-2",
      title: "Новый чат"
    });
    expect(result.current.activeChat?.id).toBe("max-main-created-chat");
    expect(result.current.isConversationOpen).toBe(true);
  });
});
