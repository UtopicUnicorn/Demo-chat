import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";

import { createChatsController } from "./chatsController.js";
import { HttpError } from "../http/httpError.js";
import { MemoryStore } from "../store/memoryStore.js";

function createResponse() {
  const response = {
    json: jest.fn(),
    status: jest.fn()
  };

  response.status.mockReturnValue(response);

  return response as unknown as Response & {
    json: jest.Mock;
    status: jest.Mock;
  };
}

function createNext() {
  return jest.fn();
}

function asNextFunction(next: ReturnType<typeof createNext>) {
  return next as unknown as NextFunction;
}

describe("createChatsController", () => {
  it("lists chats filtered by instance id", () => {
    const store = new MemoryStore();
    const controller = createChatsController(store);
    const response = createResponse();
    const next = createNext();

    store.createChat({
      instanceId: "max-main",
      recipient: "+79991234567"
    });
    store.createChat({
      instanceId: "telegram-main",
      recipient: "@demo_user"
    });

    controller.listChats(
      {
        query: {
          instanceId: "telegram-main"
        }
      } as unknown as Request,
      response,
      asNextFunction(next)
    );

    expect(next).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          instanceId: "telegram-main",
          messenger: "telegram"
        })
      ]
    });
  });

  it("creates a chat response", () => {
    const controller = createChatsController(new MemoryStore());
    const response = createResponse();
    const next = createNext();

    controller.createChat(
      {
        body: {
          instanceId: "max-main",
          recipient: "+79991234567",
          title: "Demo contact"
        }
      } as Request,
      response,
      asNextFunction(next)
    );

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      data: expect.objectContaining({
        instanceId: "max-main",
        messenger: "max",
        recipient: "+79991234567",
        title: "Demo contact"
      })
    });
  });

  it("passes validation errors to next middleware", () => {
    const controller = createChatsController(new MemoryStore());
    const response = createResponse();
    const next = createNext();

    controller.createChat(
      {
        body: {
          instanceId: "max-main"
        }
      } as Request,
      response,
      asNextFunction(next)
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]).toEqual(expect.objectContaining({ statusCode: 400 }));
  });

  it("passes unknown instance errors to next middleware", () => {
    const controller = createChatsController(new MemoryStore());
    const response = createResponse();
    const next = createNext();

    controller.createChat(
      {
        body: {
          instanceId: "unknown-instance",
          recipient: "+79991234567"
        }
      } as Request,
      response,
      asNextFunction(next)
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]).toEqual(expect.objectContaining({ statusCode: 404 }));
  });

  it("lists chat messages", () => {
    const store = new MemoryStore();
    const controller = createChatsController(store);
    const response = createResponse();
    const next = createNext();
    const chat = store.createChat({
      instanceId: "max-main",
      recipient: "+79991234567"
    });

    expect(chat).not.toBeNull();
    store.createMessage({
      chatId: chat!.id,
      text: "Hello"
    });

    controller.listMessages(
      {
        params: {
          chatId: chat!.id
        }
      } as unknown as Request,
      response,
      asNextFunction(next)
    );

    expect(next).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          direction: "outgoing",
          text: "Hello"
        })
      ]
    });
  });

  it("creates an outgoing message response", () => {
    const store = new MemoryStore();
    const controller = createChatsController(store);
    const response = createResponse();
    const next = createNext();
    const chat = store.createChat({
      instanceId: "max-main",
      recipient: "+79991234567"
    });

    expect(chat).not.toBeNull();

    controller.createOutgoingMessage(
      {
        body: {
          text: "Hello"
        },
        params: {
          chatId: chat!.id
        }
      } as unknown as Request,
      response,
      asNextFunction(next)
    );

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      data: expect.objectContaining({
        direction: "outgoing",
        status: "sent",
        text: "Hello"
      })
    });
  });

  it("creates an incoming message response", () => {
    const store = new MemoryStore();
    const controller = createChatsController(store);
    const response = createResponse();
    const next = createNext();
    const chat = store.createChat({
      instanceId: "max-main",
      recipient: "+79991234567"
    });

    expect(chat).not.toBeNull();

    controller.createIncomingMessage(
      {
        body: {
          text: "Hi"
        },
        params: {
          chatId: chat!.id
        }
      } as unknown as Request,
      response,
      asNextFunction(next)
    );

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      data: expect.objectContaining({
        direction: "incoming",
        status: "delivered",
        text: "Hi"
      })
    });
  });

  it("passes unknown chat errors to next middleware", () => {
    const controller = createChatsController(new MemoryStore());
    const response = createResponse();
    const next = createNext();

    controller.createOutgoingMessage(
      {
        body: {
          text: "Hello"
        },
        params: {
          chatId: "unknown-chat"
        }
      } as unknown as Request,
      response,
      asNextFunction(next)
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect(next.mock.calls[0][0]).toEqual(expect.objectContaining({ statusCode: 404 }));
  });
});
