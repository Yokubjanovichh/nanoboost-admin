import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./RatingStarsInput.module.css";

const STARS = [1, 2, 3, 4, 5];

export function RatingStarsInput({ value, onChange, label, error, disabled = false }) {
  const current = Math.max(0, Math.min(5, Number(value) || 0));
  const [hover, setHover] = useState(0);
  const display = hover > 0 ? hover : current;

  const handleSelect = (n) => {
    if (disabled) return;
    onChange?.(n === current ? 0 : n);
  };

  const handleKeyDown = (event, focusIndex) => {
    if (disabled) return;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange?.(Math.min(5, current + 1) || 1);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange?.(Math.max(0, current - 1));
      return;
    }
    if (event.key >= "1" && event.key <= "5") {
      event.preventDefault();
      onChange?.(Number(event.key));
      return;
    }
    if (event.key === "0" || event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      onChange?.(0);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(focusIndex + 1);
    }
  };

  return (
    <div className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <div
        className={cn(styles.row, error && styles.rowError, disabled && styles.rowDisabled)}
        role="radiogroup"
        aria-label={label ?? "Рейтинг"}
        aria-invalid={Boolean(error) || undefined}
      >
        {STARS.map((n, idx) => (
          <button
            key={n}
            type="button"
            className={cn(styles.starBtn, n <= display && styles.starBtnFilled)}
            onClick={() => handleSelect(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            disabled={disabled}
            role="radio"
            aria-checked={n === current}
            aria-label={`${n} ${n === 1 ? "звезда" : n < 5 ? "звезды" : "звёзд"}`}
            tabIndex={n === current || (current === 0 && n === 1) ? 0 : -1}
          >
            <Star size={28} fill={n <= display ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        ))}
        <span className={styles.summary}>
          {current > 0 ? `${current}/5` : "—"}
        </span>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
