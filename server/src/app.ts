import cors from "cors";
import express from "express";

import { config } from "./config.js";
import { errorMiddleware } from "./http/errorMiddleware.js";
import { createChatsRouter } from "./routes/chats.js";
import { createInstancesRouter } from "./routes/instances.js";
import { memoryStore, type MemoryStore } from "./store/memoryStore.js";

export function createApp(store: MemoryStore = memoryStore) {
  const app = express();

  app.use(
    cors({
      origin: config.clientOrigin
    })
  );
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({
      service: "messaging-gateway",
      status: "ok"
    });
  });

  app.get("/api", (_request, response) => {
    response.json({
      name: "Demo Messenger Chat API",
      service: "messaging-gateway"
    });
  });

  app.use("/api/instances", createInstancesRouter(store));
  app.use("/api/chats", createChatsRouter(store));
  app.use(errorMiddleware);

  return app;
}
