import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./Card.module.css";

export const Card = forwardRef(function Card(
  { variant = "default", header, footer, children, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.card, variant === "elevated" && styles.elevated, className)}
      {...rest}
    >
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
});

export function CardTitle({ children, className }) {
  return <h2 className={cn(styles.title, className)}>{children}</h2>;
}

export function CardDescription({ children, className }) {
  return <p className={cn(styles.description, className)}>{children}</p>;
}
