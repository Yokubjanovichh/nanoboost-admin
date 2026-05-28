// Display order — all 9 statuses backend can return (refunded is shown but
// never selectable as an admin transition target; see ORDER_STATUS_TRANSITIONS).
export const ORDER_STATUSES = [
  "pending",
  "paid",
  "awaiting_booster",
  "in_progress",
  "booster_completed",
  "delivered_to_client",
  "completed",
  "cancelled",
  "refunded",
];

// Admin-allowed transitions. `refunded` is intentionally absent from every
// target list — the provider sets it via webhook, admins must not pick it.
export const ORDER_STATUS_TRANSITIONS = {
  pending: ["paid", "cancelled"],
  paid: ["awaiting_booster", "cancelled"],
  awaiting_booster: ["in_progress", "cancelled"],
  in_progress: ["booster_completed", "cancelled"],
  booster_completed: ["delivered_to_client", "cancelled"],
  delivered_to_client: ["completed"],
  completed: [],
  cancelled: [],
  refunded: [],
};

export const ORDER_STATUS_VARIANT = {
  pending: "warning",
  paid: "info",
  awaiting_booster: "purple",
  in_progress: "info",
  booster_completed: "teal",
  delivered_to_client: "indigo",
  completed: "success",
  cancelled: "danger",
  refunded: "neutral",
};

import { CreditCard, Wallet, Bitcoin } from "lucide-react";

export const PAYMENT_METHODS = ["paypal", "usdt_trc20", "card_ecomtrade24"];

export const PAYMENT_METHOD_VARIANT = {
  paypal: "info",
  usdt_trc20: "success",
  card_ecomtrade24: "warning",
};

export const PAYMENT_METHOD_ICON = {
  paypal: Wallet,
  usdt_trc20: Bitcoin,
  card_ecomtrade24: CreditCard,
};

// Maps the order's lifecycle status onto a payment-focused label/colour
// pair used by the order detail page. `failed` is included for the
// upcoming webhook expansion (BE side); for now orders only ever land
// in pending / paid / cancelled.
export const PAYMENT_STATUS_FROM_ORDER = {
  pending: { variant: "warning", labelKey: "paymentPending" },
  paid: { variant: "success", labelKey: "paymentPaid" },
  in_progress: { variant: "success", labelKey: "paymentPaid" },
  completed: { variant: "success", labelKey: "paymentPaid" },
  cancelled: { variant: "neutral", labelKey: "paymentCancelled" },
  refunded: { variant: "neutral", labelKey: "paymentCancelled" },
  failed: { variant: "danger", labelKey: "paymentFailed" },
};

export const isFinalStatus = (status) =>
  Array.isArray(ORDER_STATUS_TRANSITIONS[status]) &&
  ORDER_STATUS_TRANSITIONS[status].length === 0;

export const getNextStatuses = (current) => ORDER_STATUS_TRANSITIONS[current] ?? [];
