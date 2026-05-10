import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Gamepad2,
  Package,
  ShoppingCart,
  Users,
  Star,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar/Avatar";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { ru } from "@/locales/ru";
import { cn, getUserDisplayName, getUserInitials, formatRole } from "@/lib/utils";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: ru.nav.dashboard },
  { to: "/games", icon: Gamepad2, label: ru.nav.games },
  { to: "/services", icon: Package, label: ru.nav.services },
  { to: "/orders", icon: ShoppingCart, label: ru.nav.orders },
  { to: "/clients", icon: Users, label: ru.nav.clients },
  { to: "/reviews", icon: Star, label: ru.nav.reviews },
];

export function Sidebar({ open = false, onClose }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user) || "Администратор";
  const roleLabel = formatRole(user?.role);

  return (
    <>
      {open && <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />}
      <aside className={cn(styles.sidebar, open && styles.sidebarOpen)} aria-label="Навигация">
        <div className={styles.brand}>
          <img src="/logo.svg" alt="" className={styles.logoIcon} aria-hidden="true" />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Nanoboost</span>
            <span className={styles.brandSubtitle}>Админ-панель</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(styles.navItem, isActive && styles.navItemActive)}
              onClick={onClose}
            >
              <Icon size={18} className={styles.navIcon} aria-hidden="true" />
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userCard}>
            <Avatar size="md">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className={styles.userInfo}>
              <span className={styles.userName} title={displayName}>
                {displayName}
              </span>
              <span className={styles.userEmail} title={roleLabel}>
                {roleLabel}
              </span>
            </div>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => logout.mutate()}
              aria-label={ru.nav.logout}
              title={ru.nav.logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
