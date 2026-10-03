import type { Chat } from "@/shared/types/messaging";

export const demoChats: Chat[] = [
  {
    createdAt: "2026-10-02T06:00:00.000Z",
    id: "max-alex",
    instanceId: "max-main",
    lastMessage: null,
    messenger: "max",
    recipient: "+7 999 123-45-67",
    title: "Анна Иванова",
    updatedAt: "2026-10-02T06:20:00.000Z"
  },
  {
    createdAt: "2026-10-02T07:00:00.000Z",
    id: "telegram-team",
    instanceId: "telegram-main",
    lastMessage: null,
    messenger: "telegram",
    recipient: "@demo_team",
    title: "Demo Team",
    updatedAt: "2026-10-02T07:05:00.000Z"
  },
  {
    createdAt: "2026-10-02T08:25:00.000Z",
    id: "whatsapp-maria",
    instanceId: "whatsapp-main",
    lastMessage: null,
    messenger: "whatsapp",
    recipient: "+7 912 000-13-37",
    title: "Иван Петров",
    updatedAt: "2026-10-02T08:32:00.000Z"
  }
];
