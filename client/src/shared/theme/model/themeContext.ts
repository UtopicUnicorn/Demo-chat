import { createContext } from "react";

import type { MessengerType } from "@/shared/types/messaging";

export type ThemeContextValue = {
  accent: MessengerType;
};

export const defaultAccent: MessengerType = "max";

export const ThemeContext = createContext<ThemeContextValue>({
  accent: defaultAccent
});
