import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./Select.module.css";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef(function SelectTrigger(
  { className, children, ...rest },
  ref,
) {
  return (
    <SelectPrimitive.Trigger ref={ref} className={cn(styles.trigger, className)} {...rest}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={16} className={styles.chevron} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

export const SelectContent = forwardRef(function SelectContent(
  { className, children, position = "popper", ...rest },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(styles.content, className)}
        position={position}
        {...rest}
      >
        <SelectPrimitive.Viewport className={styles.viewport}>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export const SelectItem = forwardRef(function SelectItem({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Item ref={ref} className={cn(styles.item, className)} {...rest}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className={styles.itemIndicator}>
        <SelectPrimitive.ItemIndicator>
          <Check size={14} />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
});

export const SelectSeparator = forwardRef(function SelectSeparator({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.Separator ref={ref} className={cn(styles.separator, className)} {...rest} />
  );
});
