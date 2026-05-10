import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import styles from "./Textarea.module.css";

export const Textarea = forwardRef(function Textarea(
  { label, error, helperText, rows = 4, id, className, fullWidth = true, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id || reactId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn(styles.field, fullWidth && styles.fullWidth, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(styles.textarea, hasError && styles.textareaError)}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        {...rest}
      />
      {hasError ? (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className={styles.helperText}>{helperText}</p>
      ) : null}
    </div>
  );
});
