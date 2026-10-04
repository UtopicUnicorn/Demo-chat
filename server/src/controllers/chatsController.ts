import type { RequestHandler } from "express";

import { HttpError } from "../http/httpError.js";
import {
  readBody,
  readOptionalString,
  readRequiredString,
  readRouteParam
} from "../http/validate.js";
import type { MessagingService } from "../services/messagingService.js";

export function createChatsController(messagingService: MessagingService) {
  const listChats: RequestHandler = (request, response) => {
    const query = request.query ?? {};
    const instanceId = typeof query.instanceId === "string" ? query.instanceId : undefined;
    const phone = typeof query.phone === "string" ? query.phone : undefined;

    response.json({
      data: messagingService.listChats(instanceId, phone)
    });
  };

  const createChat: RequestHandler = (request, response, next) => {
    try {
      const body = readBody(request.body);
      const chat = messagingService.createChat({
        instanceId: readRequiredString(body, "instanceId"),
        ownerPhone: readOptionalString(body, "phone"),
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
      const query = request.query ?? {};
      const phone = typeof query.phone === "string" ? query.phone : undefined;
      const messages = messagingService.listMessages(chatId, phone);

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
      const message = messagingService.createMessage({
        chatId,
        senderPhone: readOptionalString(body, "phone"),
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
      const message = messagingService.createMessage(
        {
          chatId,
          senderPhone: readOptionalString(body, "phone"),
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
