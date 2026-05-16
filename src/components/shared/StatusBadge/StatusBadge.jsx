import { Badge } from "@/components/ui/Badge/Badge";
import { ru } from "@/locales/ru";
import { ORDER_STATUS_VARIANT } from "@/features/orders/constants";
import {
  GAME_STATUS_LABEL,
  GAME_STATUS_VARIANT,
} from "@/features/games/constants";

export function StatusBadge({ type = "active", isActive, status, size }) {
  if (type === "order" && status) {
    const variant = ORDER_STATUS_VARIANT[status] ?? "neutral";
    const label = ru.orders?.status?.[status] ?? status;
    return <Badge variant={variant} data-size={size}>{label}</Badge>;
  }

  if (type === "game" && status) {
    const variant = GAME_STATUS_VARIANT[status] ?? "neutral";
    const label = GAME_STATUS_LABEL[status] ?? status;
    return <Badge variant={variant} data-size={size}>{label}</Badge>;
  }

  return (
    <Badge variant={isActive ? "success" : "neutral"} data-size={size}>
      {isActive ? ru.common.active : ru.common.inactive}
    </Badge>
  );
}
