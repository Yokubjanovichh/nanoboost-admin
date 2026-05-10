import { NumberInput } from "@/components/ui/NumberInput/NumberInput";
import { cn } from "@/lib/utils";
import styles from "./PriceInput.module.css";

export function PriceInput({
  usdValue,
  eurValue,
  onUsdChange,
  onEurChange,
  usdError,
  eurError,
  label = "Цена",
  helperText = "Введите цену для каждой валюты отдельно",
  className,
  disabled = false,
}) {
  return (
    <div className={cn(styles.wrap, className)}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.row}>
        <NumberInput
          prefix={<span className={styles.symbol}>$</span>}
          placeholder="0.00"
          step="0.01"
          min={0}
          value={usdValue ?? ""}
          onChange={(e) => onUsdChange?.(e.target.value)}
          error={usdError}
          disabled={disabled}
        />
        <NumberInput
          prefix={<span className={styles.symbol}>€</span>}
          placeholder="0.00"
          step="0.01"
          min={0}
          value={eurValue ?? ""}
          onChange={(e) => onEurChange?.(e.target.value)}
          error={eurError}
          disabled={disabled}
        />
      </div>
      {helperText && !usdError && !eurError && <p className={styles.helper}>{helperText}</p>}
    </div>
  );
}
