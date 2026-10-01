import { Router } from "express";

import { createChatsController } from "../controllers/chatsController.js";
import type { MemoryStore } from "../store/memoryStore.js";

export function createChatsRouter(store: MemoryStore) {
  const router = Router();
  const controller = createChatsController(store);

  router.get("/", controller.listChats);
  router.post("/", controller.createChat);
  router.get("/:chatId/messages", controller.listMessages);
  router.post("/:chatId/messages", controller.createOutgoingMessage);
  router.post("/:chatId/incoming-messages", controller.createIncomingMessage);

  return router;
}
