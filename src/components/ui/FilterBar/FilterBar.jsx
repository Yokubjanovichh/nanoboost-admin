import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { ru } from "@/locales/ru";
import { cn } from "@/lib/utils";
import styles from "./FilterBar.module.css";

export function FilterBar({
  children,
  leading,
  trailing,
  onReset,
  canReset = false,
  className,
}) {
  const showReset = typeof onReset === "function";

  return (
    <div className={cn(styles.bar, className)}>
      <div className={styles.leading}>{leading}</div>
      <div className={styles.center}>{children}</div>
      <div className={styles.trailing}>
        {trailing}
        {showReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={onReset}
            disabled={!canReset}
            title={ru.common.resetFiltersTooltip}
            aria-label={ru.common.resetFiltersTooltip}
          >
            {ru.common.resetFilters}
          </Button>
        )}
      </div>
    </div>
  );
}
