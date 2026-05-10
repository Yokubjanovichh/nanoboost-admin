import { Calendar } from "lucide-react";
import { ru } from "@/locales/ru";
import { cn } from "@/lib/utils";
import styles from "./DateRangeFilter.module.css";

export function DateRangeFilter({ from, to, onChange, label, className }) {
  const handleFrom = (e) => onChange?.({ from: e.target.value || "", to });
  const handleTo = (e) => onChange?.({ from, to: e.target.value || "" });

  return (
    <div className={cn(styles.wrap, className)}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.row}>
        <div className={styles.inputWrap}>
          <Calendar size={14} className={styles.icon} aria-hidden="true" />
          <input
            type="date"
            className={styles.input}
            value={from ?? ""}
            onChange={handleFrom}
            aria-label={ru.orders?.filters?.dateFrom ?? "С"}
          />
        </div>
        <span className={styles.sep}>–</span>
        <div className={styles.inputWrap}>
          <Calendar size={14} className={styles.icon} aria-hidden="true" />
          <input
            type="date"
            className={styles.input}
            value={to ?? ""}
            onChange={handleTo}
            aria-label={ru.orders?.filters?.dateTo ?? "По"}
          />
        </div>
      </div>
    </div>
  );
}
