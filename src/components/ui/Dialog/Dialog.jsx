import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./Dialog.module.css";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef(function DialogContent(
  { className, children, showClose = true, ...rest },
  ref,
) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={styles.overlay} />
      <DialogPrimitive.Content ref={ref} className={cn(styles.content, className)} {...rest}>
        {children}
        {showClose && (
          <DialogPrimitive.Close className={styles.closeButton} aria-label="Закрыть">
            <X size={18} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function DialogHeader({ className, children }) {
  return <div className={cn(styles.header, className)}>{children}</div>;
}

export function DialogFooter({ className, children }) {
  return <div className={cn(styles.footer, className)}>{children}</div>;
}

export const DialogTitle = forwardRef(function DialogTitle({ className, ...rest }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cn(styles.title, className)} {...rest} />;
});

export const DialogDescription = forwardRef(function DialogDescription({ className, ...rest }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(styles.description, className)}
      {...rest}
    />
  );
});
