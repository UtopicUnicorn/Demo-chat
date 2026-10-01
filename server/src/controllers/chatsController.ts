import type { RequestHandler } from "express";

import { HttpError } from "../http/httpError.js";
import {
  readBody,
  readOptionalString,
  readRequiredString,
  readRouteParam
} from "../http/validate.js";
import type { MemoryStore } from "../store/memoryStore.js";

export function createChatsController(store: MemoryStore) {
  const listChats: RequestHandler = (request, response) => {
    const instanceId =
      typeof request.query.instanceId === "string" ? request.query.instanceId : undefined;

    response.json({
      data: store.listChats(instanceId)
    });
  };

  const createChat: RequestHandler = (request, response, next) => {
    try {
      const body = readBody(request.body);
      const chat = store.createChat({
        instanceId: readRequiredString(body, "instanceId"),
        recipient: readRequiredString(body, "recipient"),
        title: readOptionalString(body, "title")
      });

      if (!chat) {
        throw new HttpError(404, "Instance not found");
      }

      response.status(201).json({
        data: chat
      });
    } catch (error) {
      next(error);
    }
  };

  const listMessages: RequestHandler = (request, response, next) => {
    try {
      const chatId = readRouteParam(request.params.chatId, "chatId");
      const messages = store.listMessages(chatId);

      if (!messages) {
        throw new HttpError(404, "Chat not found");
      }

      response.json({
        data: messages
      });
    } catch (error) {
      next(error);
    }
  };

  const createOutgoingMessage: RequestHandler = (request, response, next) => {
    try {
      const body = readBody(request.body);
      const chatId = readRouteParam(request.params.chatId, "chatId");
      const message = store.createMessage({
        chatId,
        text: readRequiredString(body, "text")
      });

      if (!message) {
        throw new HttpError(404, "Chat not found");
      }

      response.status(201).json({
        data: message
      });
    } catch (error) {
      next(error);
    }
  };

  const createIncomingMessage: RequestHandler = (request, response, next) => {
    try {
      const body = readBody(request.body);
      const chatId = readRouteParam(request.params.chatId, "chatId");
      const message = store.createMessage(
        {
          chatId,
          text: readRequiredString(body, "text")
        },
        "incoming"
      );

      if (!message) {
        throw new HttpError(404, "Chat not found");
      }

      response.status(201).json({
        data: message
      });
    } catch (error) {
      next(error);
    }
  };

  return {
    createChat,
    createIncomingMessage,
    createOutgoingMessage,
    listChats,
    listMessages
  };
}
