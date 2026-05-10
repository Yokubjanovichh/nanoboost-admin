import { forwardRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./DropdownMenu.module.css";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = forwardRef(function DropdownMenuContent(
  { className, sideOffset = 6, align = "end", ...rest },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(styles.content, className)}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export const DropdownMenuItem = forwardRef(function DropdownMenuItem(
  { className, danger = false, inset = false, ...rest },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(styles.item, danger && styles.itemDanger, inset && styles.inset, className)}
      {...rest}
    />
  );
});

export const DropdownMenuCheckboxItem = forwardRef(function DropdownMenuCheckboxItem(
  { className, children, checked, ...rest },
  ref,
) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      className={cn(styles.item, styles.checkboxItem, className)}
      {...rest}
    >
      <span className={styles.itemIndicator}>
        <DropdownMenuPrimitive.ItemIndicator>
          <Check size={14} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

export function DropdownMenuLabel({ className, inset = false, children }) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(styles.label, inset && styles.inset, className)}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  );
}

export const DropdownMenuSeparator = forwardRef(function DropdownMenuSeparator(
  { className, ...rest },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn(styles.separator, className)}
      {...rest}
    />
  );
});
