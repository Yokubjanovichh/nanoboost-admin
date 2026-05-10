import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./Button.module.css";

const VARIANTS = {
  primary: styles.variantPrimary,
  secondary: styles.variantSecondary,
  ghost: styles.variantGhost,
  danger: styles.variantDanger,
};

const SIZES = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    type = "button",
    icon,
    iconPosition = "left",
    loading = false,
    disabled = false,
    fullWidth = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        styles.button,
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className={cn(styles.icon, styles.spinner)} aria-hidden="true" />
      ) : (
        icon &&
        iconPosition === "left" && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {children && <span className={styles.label}>{children}</span>}
      {!loading && icon && iconPosition === "right" && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
});
