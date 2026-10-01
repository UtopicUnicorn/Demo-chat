import cors from "cors";
import express from "express";

import { config } from "./config.js";

export function createApp() {
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

  return app;
}
