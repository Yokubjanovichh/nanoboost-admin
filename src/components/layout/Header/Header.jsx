import { useLocation } from "react-router-dom";
import { Bell, Menu, ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu/DropdownMenu";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar/Avatar";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { getUserDisplayName, getUserInitials } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./Header.module.css";

const PAGE_TITLES = {
  "/dashboard": ru.pages.dashboard.title,
  "/games": ru.pages.games.title,
  "/services": ru.pages.services.title,
  "/orders": ru.pages.orders.title,
  "/clients": ru.pages.clients.title,
  "/reviews": ru.pages.reviews.title,
};

export function Header({ onMenuClick }) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const title = PAGE_TITLES[location.pathname] ?? "";
  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user) || "Администратор";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Меню"
        >
          <Menu size={20} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Уведомления"
          title="Скоро"
          disabled
        >
          <Bell size={18} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={styles.userButton}>
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className={styles.userName}>{displayName}</span>
              <ChevronDown size={16} className={styles.userChevron} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{ru.auth.welcome}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User size={14} />
              {ru.nav.profile}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem danger onSelect={() => logout.mutate()}>
              <LogOut size={14} />
              {ru.nav.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
