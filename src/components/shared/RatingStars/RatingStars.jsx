import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./RatingStars.module.css";

const SIZE_PX = {
  sm: 14,
  md: 18,
  lg: 24,
};

export function RatingStars({ rating, size = "md", showLabel = false, className }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const px = SIZE_PX[size] ?? SIZE_PX.md;

  return (
    <span
      className={cn(styles.row, className)}
      role="img"
      aria-label={`Рейтинг: ${value} из 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={px}
          className={cn(styles.star, n <= value && styles.starFilled)}
          fill={n <= value ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
      {showLabel && <span className={styles.label}>{value}/5</span>}
    </span>
  );
}
