import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./StatsCard.module.css";

export function StatsCard({ label, value, icon, trend, color = "primary", className }) {
  const trendValue = trend?.value;
  const trendDirection = trend?.direction ?? (trendValue > 0 ? "up" : trendValue < 0 ? "down" : null);

  return (
    <div className={cn(styles.card, styles[`color${color[0].toUpperCase()}${color.slice(1)}`], className)}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {trend && (
          <span
            className={cn(
              styles.trend,
              trendDirection === "up" && styles.trendUp,
              trendDirection === "down" && styles.trendDown,
            )}
          >
            {trendDirection === "up" ? (
              <ArrowUp size={12} />
            ) : trendDirection === "down" ? (
              <ArrowDown size={12} />
            ) : null}
            <span>{trend.label ?? trendValue}</span>
          </span>
        )}
      </div>
    </div>
  );
}
