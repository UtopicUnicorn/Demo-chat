import { Router } from "express";

import { createInstancesController } from "../controllers/instancesController.js";
import type { MemoryStore } from "../store/memoryStore.js";

export function createInstancesRouter(store: MemoryStore) {
  const router = Router();
  const controller = createInstancesController(store);

  router.get("/", controller.listInstances);
  router.get("/:instanceId", controller.getInstance);

  return router;
}
