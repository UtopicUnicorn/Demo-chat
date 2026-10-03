import type { MessengerInstance } from "@/shared/types/messaging";
import styles from "./InstanceTabs.module.css";

type InstanceTabsProps = {
  activeInstanceId: string;
  instances: MessengerInstance[];
  onSelectInstance(instanceId: string): void;
};

export function InstanceTabs({ activeInstanceId, instances, onSelectInstance }: InstanceTabsProps) {
  return (
    <nav className={styles.instanceTabs} aria-label="Инстансы мессенджеров">
      {instances.map((instance) => (
        <button
          aria-pressed={instance.id === activeInstanceId}
          className={styles.instanceTab}
          key={instance.id}
          onClick={() => onSelectInstance(instance.id)}
          type="button"
        >
          {instance.label}
        </button>
      ))}
    </nav>
  );
}
