import type { ReactNode } from "react";

import type { MessengerType } from "@/shared/types/messaging";
import { defaultAccent, ThemeContext } from "@/shared/theme/model/themeContext";

type ThemeProviderProps = {
  accent?: MessengerType;
  children: ReactNode;
};

export function ThemeProvider({ accent = defaultAccent, children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={{ accent }}>{children}</ThemeContext.Provider>;
}
