import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import {
  AXIS_PROPS,
  CHART_PALETTE,
  GRID_PROPS,
  STATUS_COLOR,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import { ORDER_STATUSES } from "@/features/orders/constants";
import { ru } from "@/locales/ru";
import styles from "./StatusBreakdown.module.css";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={TOOLTIP_LABEL_STYLE}>{item.payload.label}</div>
      <div style={TOOLTIP_ITEM_STYLE}>
        {ru.common.status}: <strong>{item.value}</strong>
      </div>
    </div>
  );
}

export function StatusBreakdown({ byStatus, isLoading }) {
  const chartData = useMemo(() => {
    if (!byStatus) return [];
    return ORDER_STATUSES.map((status) => ({
      status,
      label: ru.orders.status[status] ?? status,
      count: Number(byStatus[status] ?? 0),
      fill: STATUS_COLOR[status] ?? CHART_PALETTE.primary,
    })).filter((item) => item.count > 0);
  }, [byStatus]);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }

  if (chartData.length === 0) {
    return <EmptyState title={ru.dashboard.status.empty} />;
  }

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="label" {...AXIS_PROPS} />
          <YAxis allowDecimals={false} {...AXIS_PROPS} width={32} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
