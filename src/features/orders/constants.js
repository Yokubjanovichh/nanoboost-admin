export const ORDER_STATUSES = ["pending", "paid", "in_progress", "completed", "cancelled", "refunded"];

export const ORDER_STATUS_TRANSITIONS = {
  pending: ["paid", "cancelled"],
  paid: ["in_progress", "refunded", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

export const ORDER_STATUS_VARIANT = {
  pending: "warning",
  paid: "info",
  in_progress: "info",
  completed: "success",
  cancelled: "neutral",
  refunded: "danger",
};

export const PAYMENT_METHODS = ["paypal", "usdt_trc20"];

export const PAYMENT_METHOD_VARIANT = {
  paypal: "info",
  usdt_trc20: "success",
};

export const isFinalStatus = (status) =>
  Array.isArray(ORDER_STATUS_TRANSITIONS[status]) &&
  ORDER_STATUS_TRANSITIONS[status].length === 0;

export const getNextStatuses = (current) => ORDER_STATUS_TRANSITIONS[current] ?? [];
