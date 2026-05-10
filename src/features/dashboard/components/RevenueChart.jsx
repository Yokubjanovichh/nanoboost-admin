import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import { formatCurrency, formatDateOnly } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./RevenueChart.module.css";

const formatTick = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
};

const formatYTick = (value) => {
  const num = Number(value) || 0;
  if (num >= 1000) return `$${Math.round(num / 100) / 10}k`;
  return `$${num}`;
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={TOOLTIP_LABEL_STYLE}>{formatDateOnly(label)}</div>
      <div style={TOOLTIP_ITEM_STYLE}>
        {ru.dashboard.revenue.tooltip}: <strong>{formatCurrency(payload[0].value, "USD")}</strong>
      </div>
    </div>
  );
}

export function RevenueChart({ data, isLoading }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((point) => ({
      date: point.date ?? point.day ?? point.bucket,
      revenue: Number(point.revenue_usd ?? point.revenue ?? 0),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }

  if (chartData.length === 0) {
    return <EmptyState title={ru.dashboard.revenue.empty} />;
  }

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_PALETTE.primary} stopOpacity={0.5} />
              <stop offset="100%" stopColor={CHART_PALETTE.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="date" tickFormatter={formatTick} {...AXIS_PROPS} />
          <YAxis tickFormatter={formatYTick} {...AXIS_PROPS} width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_PALETTE.grid }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={CHART_PALETTE.primary}
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: CHART_PALETTE.primary, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
