import { ru } from "@/locales/ru";

export const GAME_STATUSES = ["active", "coming_soon", "hidden"];

export const GAME_STATUS_LABEL = {
  active: ru.games.statusActive,
  coming_soon: ru.games.statusComingSoon,
  hidden: ru.games.statusHidden,
};

export const GAME_STATUS_VARIANT = {
  active: "success",
  coming_soon: "warning",
  hidden: "neutral",
};
