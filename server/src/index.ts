import { createServer } from "node:http";

import { createApp } from "./app.js";
import { config } from "./config.js";
import type { Chat, Message } from "./domain/messaging.js";
import { createRealtimeHub } from "./realtime/realtimeHub.js";
import { type MessagingEvents, MessagingService } from "./services/messagingService.js";
import { memoryStore } from "./store/memoryStore.js";

let realtimeEvents: MessagingEvents | null = null;

const messagingEvents: MessagingEvents = {
  chatUpdated(chat: Chat) {
    realtimeEvents?.chatUpdated(chat);
  },
  messageCreated(message: Message, chat: Chat) {
    realtimeEvents?.messageCreated(message, chat);
  }
};

const messagingService = new MessagingService(memoryStore, messagingEvents);
const app = createApp(memoryStore, messagingService);
const httpServer = createServer(app);

realtimeEvents = createRealtimeHub(httpServer, messagingService);

httpServer.listen(config.port, config.host, () => {
  console.log(`Messaging gateway is running on http://${config.host}:${config.port}`);
});
