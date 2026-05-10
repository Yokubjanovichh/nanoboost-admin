import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./EmptyState.module.css";

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.icon}>{icon ?? <Inbox size={36} aria-hidden="true" />}</div>
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
