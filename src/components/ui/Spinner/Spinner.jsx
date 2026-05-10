import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./Spinner.module.css";

const SIZES = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export function Spinner({ size = "md", label = "Загрузка", className }) {
  return (
    <span
      className={cn(styles.spinner, SIZES[size] ?? SIZES.md, className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={styles.icon} aria-hidden="true" />
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}
