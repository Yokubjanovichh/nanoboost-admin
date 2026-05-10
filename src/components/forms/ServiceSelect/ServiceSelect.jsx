import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { useServicesList } from "@/features/services/hooks/useServices";
import { ru } from "@/locales/ru";

const NONE = "__none__";

export function ServiceSelect({
  value,
  onChange,
  error,
  label,
  includeNone = false,
  noneLabel,
  disabled = false,
}) {
  // page_size capped at 100 by backend Pydantic validator (>100 → 422).
  // No `sort` — backend default (-created_at) works fine. is_active=true
  // so disabled services don't appear in pickers.
  const { data, isLoading } = useServicesList({ page_size: 100, is_active: true });
  const services = data?.items ?? [];

  // Radix Select needs to remount once items become available so it can
  // resolve the displayed text against the current value (see GameSelect).
  const selectKey = `ss-${isLoading ? "loading" : services.length}`;

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
        key={selectKey}
        value={value || (includeNone ? NONE : "")}
        onValueChange={(v) => onChange?.(v === NONE ? null : v)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? ru.common.loading : "—"} />
        </SelectTrigger>
        <SelectContent>
          {includeNone && (
            <SelectItem value={NONE}>{noneLabel ?? ru.reviews.filters.noService}</SelectItem>
          )}
          {services.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p
          role="alert"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-danger)",
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
