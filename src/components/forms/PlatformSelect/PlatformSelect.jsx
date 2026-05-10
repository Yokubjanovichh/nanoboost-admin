import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { ru } from "@/locales/ru";

export const PLATFORM_OPTIONS = [
  { value: "ps", label: ru.services.platforms.ps },
  { value: "xbox", label: ru.services.platforms.xbox },
  { value: "pc", label: ru.services.platforms.pc },
];

export function PlatformSelect({ value, onChange, error, label, disabled = false }) {
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
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {PLATFORM_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
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
