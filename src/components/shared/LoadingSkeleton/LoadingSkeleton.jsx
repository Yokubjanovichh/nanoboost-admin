import { cn } from "@/lib/utils";
import styles from "./LoadingSkeleton.module.css";

export function LoadingSkeleton({ width, height = 16, radius, className, style }) {
  return (
    <span
      className={cn(styles.skeleton, className)}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
