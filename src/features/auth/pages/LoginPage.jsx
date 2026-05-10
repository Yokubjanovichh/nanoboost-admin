import { Navigate } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card/Card";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { ru } from "@/locales/ru";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb} aria-hidden="true" />
      <div className={styles.orbSecondary} aria-hidden="true" />

      <div className={styles.cardWrap}>
        <div className={styles.brand}>
          <img src="/logo.svg" alt="" className={styles.logoIcon} aria-hidden="true" />
          <span className={styles.logoText}>Nanoboost</span>
        </div>

        <Card
          variant="elevated"
          header={
            <>
              <CardTitle>{ru.auth.loginTitle}</CardTitle>
              <CardDescription>{ru.auth.loginSubtitle}</CardDescription>
            </>
          }
        >
          <LoginForm />
        </Card>

        <p className={styles.footnote}>© {new Date().getFullYear()} Nanoboost</p>
      </div>
    </div>
  );
}
