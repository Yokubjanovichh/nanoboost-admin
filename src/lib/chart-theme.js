// Recharts dark theme palette aligned with tokens.css.
// Use for stroke/fill props on chart components.

export const CHART_PALETTE = {
  primary: "#6849fe",
  primaryLight: "rgba(104, 73, 254, 0.18)",
  cyan: "#2de1fe",
  violet: "#9d21fe",
  teal: "#14b8a6",
  indigo: "#6366f1",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  textPrimary: "#ffffff",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.5)",
  grid: "rgba(255, 255, 255, 0.08)",
  bgElevated: "#221d44",
  border: "rgba(255, 255, 255, 0.08)",
};

// Color map for the 9-state pipeline. cancelled = danger (active negative),
// refunded = muted (closed/dormant) — semantic flip from earlier mapping.
export const STATUS_COLOR = {
  pending: CHART_PALETTE.warning,
  paid: CHART_PALETTE.info,
  awaiting_booster: CHART_PALETTE.violet,
  in_progress: CHART_PALETTE.cyan,
  booster_completed: CHART_PALETTE.teal,
  delivered_to_client: CHART_PALETTE.indigo,
  completed: CHART_PALETTE.success,
  cancelled: CHART_PALETTE.danger,
  refunded: CHART_PALETTE.textMuted,
};

export const AXIS_PROPS = {
  stroke: CHART_PALETTE.textMuted,
  fontSize: 12,
  tickLine: false,
  axisLine: { stroke: CHART_PALETTE.grid },
};

export const GRID_PROPS = {
  stroke: CHART_PALETTE.grid,
  strokeDasharray: "3 3",
  vertical: false,
};

export const TOOLTIP_STYLE = {
  backgroundColor: CHART_PALETTE.bgElevated,
  border: `1px solid ${CHART_PALETTE.border}`,
  borderRadius: "8px",
  fontSize: "13px",
  color: CHART_PALETTE.textPrimary,
  padding: "8px 12px",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
};

export const TOOLTIP_LABEL_STYLE = {
  color: CHART_PALETTE.textMuted,
  fontSize: "11px",
  marginBottom: "4px",
};

export const TOOLTIP_ITEM_STYLE = {
  color: CHART_PALETTE.textPrimary,
};
