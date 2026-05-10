import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { getNextStatuses, isFinalStatus } from "@/features/orders/constants";
import { ru } from "@/locales/ru";

export function OrderStatusSelect({ currentStatus, value, onChange, error, label, disabled = false }) {
  const next = getNextStatuses(currentStatus);
  const isFinal = isFinalStatus(currentStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {label && (
        <label
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--color-text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <Select
        value={value || ""}
        onValueChange={(v) => onChange?.(v)}
        disabled={disabled || isFinal || next.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={isFinal ? ru.orders.status.finalNote : "—"} />
        </SelectTrigger>
        <SelectContent>
          {next.map((status) => (
            <SelectItem key={status} value={status}>
              {ru.orders.status[status] ?? status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isFinal && (
        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          {ru.orders.status.finalNote}
        </p>
      )}
      {error && (
        <p
          role="alert"
          style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
