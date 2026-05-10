import { Children, cloneElement, isValidElement, useId } from "react";
import { cn } from "@/lib/utils";
import styles from "./FormField.module.css";

export function FormField({ label, error, helperText, required = false, className, children }) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText && !error ? `${id}-helper` : undefined;

  const child = Children.only(children);
  const enhancedChild = isValidElement(child)
    ? cloneElement(child, {
        id: child.props.id ?? id,
        "aria-invalid": Boolean(error) || child.props["aria-invalid"],
        "aria-describedby": [errorId, helperId, child.props["aria-describedby"]].filter(Boolean).join(" ") || undefined,
      })
    : child;

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      {enhancedChild}
      {error ? (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className={styles.helperText}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
