import { useContext } from "react";

import { ThemeContext } from "@/shared/theme/model/themeContext";

export function useTheme() {
  return useContext(ThemeContext);
}
