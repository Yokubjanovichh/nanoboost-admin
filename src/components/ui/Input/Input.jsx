import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import styles from "./Input.module.css";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    prefix,
    suffix,
    type = "text",
    id,
    className,
    inputClassName,
    fullWidth = true,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id || reactId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const hasError = Boolean(error);

  return (
    <div className={cn(styles.field, fullWidth && styles.fullWidth, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={cn(styles.inputWrap, hasError && styles.inputWrapError)}>
        {prefix && (
          <span className={styles.affix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(styles.input, inputClassName)}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          {...rest}
        />
        {suffix && (
          <span className={styles.affix} aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {hasError ? (
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
});
