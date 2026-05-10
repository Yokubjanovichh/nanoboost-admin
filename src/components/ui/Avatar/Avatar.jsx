import { forwardRef } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import styles from "./Avatar.module.css";

export const Avatar = forwardRef(function Avatar({ className, size = "md", ...rest }, ref) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(styles.root, styles[`size${size[0].toUpperCase()}${size.slice(1)}`], className)}
      {...rest}
    />
  );
});

export const AvatarImage = forwardRef(function AvatarImage({ className, ...rest }, ref) {
  return <AvatarPrimitive.Image ref={ref} className={cn(styles.image, className)} {...rest} />;
});

export const AvatarFallback = forwardRef(function AvatarFallback({ className, ...rest }, ref) {
  return (
    <AvatarPrimitive.Fallback ref={ref} className={cn(styles.fallback, className)} {...rest} />
  );
});
