import { forwardRef } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import styles from "./Switch.module.css";

export const Switch = forwardRef(function Switch({ className, ...rest }, ref) {
  return (
    <SwitchPrimitive.Root ref={ref} className={cn(styles.root, className)} {...rest}>
      <SwitchPrimitive.Thumb className={styles.thumb} />
    </SwitchPrimitive.Root>
  );
});
