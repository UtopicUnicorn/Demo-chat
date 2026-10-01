import { MemoryStore } from "./memoryStore.js";

describe("MemoryStore", () => {
  it("lists seeded messenger instances", () => {
    const store = new MemoryStore();

    expect(store.listInstances()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "max-main", type: "max" }),
        expect.objectContaining({ id: "telegram-main", type: "telegram" }),
        expect.objectContaining({ id: "whatsapp-main", type: "whatsapp" })
      ])
    );
  });

  it("creates chats and filters them by instance id", () => {
    const store = new MemoryStore();

    store.createChat({
      instanceId: "max-main",
      recipient: "+79991234567"
    });
    store.createChat({
      instanceId: "telegram-main",
      recipient: "@demo_user"
    });

    expect(store.listChats("telegram-main")).toEqual([
      expect.objectContaining({
        instanceId: "telegram-main",
        messenger: "telegram",
        recipient: "@demo_user"
      })
    ]);
  });

  it("creates outgoing and incoming messages", () => {
    const store = new MemoryStore();
    const chat = store.createChat({
      instanceId: "whatsapp-main",
      recipient: "+79990000000"
    });

    expect(chat).not.toBeNull();

    const outgoing = store.createMessage({
      chatId: chat!.id,
      text: "Hello"
    });
    const incoming = store.createMessage(
      {
        chatId: chat!.id,
        text: "Hi"
      },
      "incoming"
    );

    expect(outgoing).toEqual(
      expect.objectContaining({
        direction: "outgoing",
        status: "sent",
        text: "Hello"
      })
    );
    expect(incoming).toEqual(
      expect.objectContaining({
        direction: "incoming",
        status: "delivered",
        text: "Hi"
      })
    );
    expect(store.listMessages(chat!.id)).toHaveLength(2);
    expect(store.getChat(chat!.id)?.lastMessage).toEqual(incoming);
  });

  it("returns null when creating data for unknown entities", () => {
    const store = new MemoryStore();

    expect(
      store.createChat({
        instanceId: "unknown-instance",
        recipient: "+79991234567"
      })
    ).toBeNull();
    expect(
      store.createMessage({
        chatId: "unknown-chat",
        text: "Hello"
      })
    ).toBeNull();
  });
});
