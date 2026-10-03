import type { MessengerInstance } from "@/shared/types/messaging";

export const demoInstances: MessengerInstance[] = [
  {
    externalId: "max-demo-instance",
    id: "max-main",
    label: "MAX",
    status: "connected",
    type: "max"
  },
  {
    externalId: "telegram-demo-bot",
    id: "telegram-main",
    label: "Telegram",
    status: "connected",
    type: "telegram"
  },
  {
    externalId: "whatsapp-demo-instance",
    id: "whatsapp-main",
    label: "WhatsApp",
    status: "connected",
    type: "whatsapp"
  }
];
