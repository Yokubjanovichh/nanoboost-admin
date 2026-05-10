import clsx from "clsx";

export function cn(...args) {
  return clsx(...args);
}

export function formatDate(input) {
  if (!input) return "";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export function formatDateOnly(input) {
  if (!input) return "";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  RUB: "₽",
};

export function formatCurrency(amount, currency = "USD") {
  const num = Number(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? "";
  const value = num.toFixed(2);
  return currency === "EUR" || currency === "RUB" ? `${value} ${symbol}` : `${symbol}${value}`;
}

export function noop() {}

export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getUserDisplayName(user) {
  if (!user) return "";
  return user.full_name?.trim() || user.email || "";
}

export function getUserInitials(user) {
  if (!user) return "?";
  const name = user.full_name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (user.email?.[0] ?? "?").toUpperCase();
}

const ROLE_LABELS = {
  superadmin: "Супер-админ",
  admin: "Администратор",
  manager: "Менеджер",
  viewer: "Наблюдатель",
};

export function formatRole(role) {
  return ROLE_LABELS[role] ?? role ?? "";
}

export function formatRelativeDate(input) {
  if (!input) return "";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return formatDateOnly(date);
  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} нед. назад`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} мес. назад`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} г. назад`;
}
