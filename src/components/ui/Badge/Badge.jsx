import { cn } from "@/lib/utils";
import styles from "./Badge.module.css";

const VARIANTS = {
  success: styles.variantSuccess,
  warning: styles.variantWarning,
  danger: styles.variantDanger,
  info: styles.variantInfo,
  neutral: styles.variantNeutral,
};

export function Badge({ variant = "neutral", children, className, ...rest }) {
  return (
    <span
      className={cn(styles.badge, VARIANTS[variant] ?? VARIANTS.neutral, className)}
      {...rest}
    >
      {children}
    </span>
  );
}
