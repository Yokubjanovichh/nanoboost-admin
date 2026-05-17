import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/Toast";
import { ru } from "@/locales/ru";

const RESET_MS = 1800;

export function CopyButton({ value, label, title, size = "sm", variant = "secondary" }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleClick = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(ru.orders.copyLinkSuccess);
      setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      toast.error(ru.common.error, ru.orders.copyLinkError);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      icon={copied ? <Check size={14} /> : <Copy size={14} />}
      onClick={handleClick}
      disabled={!value}
      title={title}
    >
      {label ?? ru.orders.copyLink}
    </Button>
  );
}
