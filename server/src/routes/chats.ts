import { Router } from "express";

import { createChatsController } from "../controllers/chatsController.js";
import type { MessagingService } from "../services/messagingService.js";

export function createChatsRouter(messagingService: MessagingService) {
  const router = Router();
  const controller = createChatsController(messagingService);

  router.get("/", controller.listChats);
  router.post("/", controller.createChat);
  router.get("/:chatId/messages", controller.listMessages);
  router.post("/:chatId/messages", controller.createOutgoingMessage);
  router.post("/:chatId/incoming-messages", controller.createIncomingMessage);

  return router;
}
