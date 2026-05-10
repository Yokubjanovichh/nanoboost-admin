import { forwardRef } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import styles from "./Label.module.css";

export const Label = forwardRef(function Label({ className, ...rest }, ref) {
  return <LabelPrimitive.Root ref={ref} className={cn(styles.label, className)} {...rest} />;
});
