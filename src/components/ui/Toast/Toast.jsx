import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./Toast.module.css";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

let toastIdCounter = 0;

function ToastItem({ toast, onClose }) {
  const { variant = "info" } = toast;
  const Icon = ICONS[variant] ?? ICONS.info;
  return (
    <li
      className={cn(styles.toast, styles[`variant${variant[0].toUpperCase() + variant.slice(1)}`])}
      role="status"
      aria-live="polite"
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon size={20} />
      </span>
      <div className={styles.content}>
        {toast.title && <p className={styles.title}>{toast.title}</p>}
        {toast.description && <p className={styles.description}>{toast.description}</p>}
      </div>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
        <X size={16} />
      </button>
    </li>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = "info", duration = 4000 }) => {
      toastIdCounter += 1;
      const id = toastIdCounter;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      if (duration > 0) {
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const api = useMemo(
    () => ({
      success: (title, description) => showToast({ title, description, variant: "success" }),
      error: (title, description) => showToast({ title, description, variant: "error" }),
      info: (title, description) => showToast({ title, description, variant: "info" }),
      warning: (title, description) => showToast({ title, description, variant: "warning" }),
      show: showToast,
      dismiss: removeToast,
    }),
    [showToast, removeToast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ol
        className={styles.viewport}
        aria-label="Уведомления"
        data-toast-count={toasts.length}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
