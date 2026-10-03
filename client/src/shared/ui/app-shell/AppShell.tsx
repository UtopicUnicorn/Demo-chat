import type { ReactNode } from "react";

import { useTheme } from "@/shared/theme/lib/useTheme";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { accent } = useTheme();

  return (
    <main className={styles.app} data-accent={accent}>
      {children}
    </main>
  );
}
