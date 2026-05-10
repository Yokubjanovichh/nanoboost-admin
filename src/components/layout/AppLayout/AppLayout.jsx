import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { Header } from "@/components/layout/Header/Header";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={styles.main}>
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
