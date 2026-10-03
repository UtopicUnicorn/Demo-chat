import type { Message } from "@/shared/types/messaging";

export const demoMessages: Message[] = [
  {
    chatId: "max-alex",
    createdAt: "2026-10-02T06:18:00.000Z",
    direction: "incoming",
    id: "msg-1",
    instanceId: "max-main",
    messenger: "max",
    providerChatId: "+7 999 123-45-67",
    providerMessageId: "max-msg-1",
    status: "delivered",
    text: "Можешь отправить детали договора?"
  },
  {
    chatId: "max-alex",
    createdAt: "2026-10-02T06:20:00.000Z",
    direction: "outgoing",
    id: "msg-2",
    instanceId: "max-main",
    messenger: "max",
    providerChatId: "+7 999 123-45-67",
    providerMessageId: "max-msg-2",
    status: "sent",
    text: "Да, сейчас пришлю краткое описание."
  },
  {
    chatId: "telegram-team",
    createdAt: "2026-10-02T07:05:00.000Z",
    direction: "incoming",
    id: "msg-3",
    instanceId: "telegram-main",
    messenger: "telegram",
    providerChatId: "@demo_team",
    providerMessageId: "telegram-msg-3",
    status: "delivered",
    text: "Демо-инстанс Telegram готов."
  },
  {
    chatId: "whatsapp-maria",
    createdAt: "2026-10-02T08:32:00.000Z",
    direction: "incoming",
    id: "msg-4",
    instanceId: "whatsapp-main",
    messenger: "whatsapp",
    providerChatId: "+7 912 000-13-37",
    providerMessageId: "whatsapp-msg-4",
    status: "delivered",
    text: "Пожалуйста, подтвердите интервал доставки."
  }
];
