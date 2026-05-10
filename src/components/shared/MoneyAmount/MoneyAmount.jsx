import { formatCurrency, cn } from "@/lib/utils";
import styles from "./MoneyAmount.module.css";

function getPrimary({ amountUsd, amountEur, displayCurrency }) {
  if (displayCurrency === "EUR") {
    if (amountEur == null) return "—";
    return formatCurrency(amountEur, "EUR");
  }
  if (amountUsd == null) return "—";
  return formatCurrency(amountUsd, "USD");
}

export function MoneyAmount({
  amountUsd,
  amountEur,
  displayCurrency = "USD",
  size = "md",
  className,
}) {
  const primary = getPrimary({ amountUsd, amountEur, displayCurrency });

  const tooltipParts = [];
  if (amountUsd != null) tooltipParts.push(formatCurrency(amountUsd, "USD"));
  if (amountEur != null) tooltipParts.push(formatCurrency(amountEur, "EUR"));
  const tooltip = tooltipParts.join(" / ");

  return (
    <span
      className={cn(styles.amount, styles[`size${size[0].toUpperCase()}${size.slice(1)}`], className)}
      title={tooltip || undefined}
    >
      {primary}
    </span>
  );
}
