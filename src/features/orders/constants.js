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
