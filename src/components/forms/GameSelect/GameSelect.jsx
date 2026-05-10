import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { useGamesList } from "@/features/games/hooks/useGames";
import { ru } from "@/locales/ru";

export function GameSelect({ value, onChange, error, label, includeAll = false, disabled = false }) {
  const { data, isLoading } = useGamesList({ page_size: 100, is_active: true });
  const games = data?.items ?? [];

  // Radix Select caches its displayed text from initial mount. When `value` is
  // set before items load, the displayed text stays at placeholder even after
  // items arrive. Keying the Select by items-readiness forces a remount once
  // games are available, so it picks the correct displayed text.
  const selectKey = `gs-${isLoading ? "loading" : games.length}`;

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
        value={value || ""}
        onValueChange={(v) => onChange?.(v === "__all__" ? "" : v)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? ru.common.loading : "—"} />
        </SelectTrigger>
        <SelectContent>
          {includeAll && <SelectItem value="__all__">{ru.services.filters.allGames}</SelectItem>}
          {games.map((game) => (
            <SelectItem key={game.id} value={game.id}>
              {game.name}
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
