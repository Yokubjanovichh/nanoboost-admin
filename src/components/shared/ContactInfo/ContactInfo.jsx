import { useState } from "react";
import { Mail, MessageCircle, Send, Phone, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./ContactInfo.module.css";

const ICONS = {
  email: Mail,
  discord: MessageCircle,
  telegram: Send,
  whatsapp: Phone,
};

const LABELS = {
  email: "Email",
  discord: "Discord",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
};

function ContactRow({ kind, value, copyable, onCopy, copied }) {
  const Icon = ICONS[kind] ?? Mail;
  const Label = LABELS[kind];
  const isLink = kind === "email";
  const href = isLink ? `mailto:${value}` : null;

  return (
    <li className={styles.row}>
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon size={14} />
      </span>
      <span className={styles.label}>{Label}:</span>
      {href ? (
        <a className={styles.value} href={href}>
          {value}
        </a>
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      {copyable && (
        <button
          type="button"
          className={styles.copyBtn}
          onClick={onCopy}
          aria-label="Скопировать"
          title="Скопировать"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      )}
    </li>
  );
}

export function ContactInfo({ email, discord, telegram, whatsapp, className }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = async (key, value) => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // ignore
    }
  };

  const items = [
    email && { kind: "email", value: email, copyable: false },
    discord && { kind: "discord", value: discord, copyable: true },
    telegram && { kind: "telegram", value: telegram, copyable: true },
    whatsapp && { kind: "whatsapp", value: whatsapp, copyable: true },
  ].filter(Boolean);

  if (items.length === 0) {
    return <p className={styles.empty}>—</p>;
  }

  return (
    <ul className={cn(styles.list, className)}>
      {items.map((item) => (
        <ContactRow
          key={item.kind}
          kind={item.kind}
          value={item.value}
          copyable={item.copyable}
          copied={copiedKey === item.kind}
          onCopy={() => handleCopy(item.kind, item.value)}
        />
      ))}
    </ul>
  );
}
