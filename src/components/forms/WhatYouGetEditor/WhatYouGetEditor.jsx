import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import { ArrayStringField } from "@/components/forms/ArrayStringField/ArrayStringField";
import { ru } from "@/locales/ru";
import { cn } from "@/lib/utils";
import styles from "./WhatYouGetEditor.module.css";

const emptyBlock = () => ({ title: "", lead: "", items: [] });

export function WhatYouGetEditor({ value, onChange, label, className }) {
  const blocks = Array.isArray(value) ? value : [];

  const update = (next) => onChange?.(next);

  const handleBlockChange = (index, key, newValue) => {
    const next = blocks.map((b, i) => (i === index ? { ...b, [key]: newValue } : b));
    update(next);
  };

  const handleAdd = () => update([...blocks, emptyBlock()]);

  const handleRemove = (index) => update(blocks.filter((_, i) => i !== index));

  return (
    <div className={cn(styles.field, className)}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.list}>
        {blocks.map((block, index) => (
          <div key={index} className={styles.card}>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => handleRemove(index)}
              aria-label={ru.services.arrayEditor.removeItem}
              title={ru.services.arrayEditor.removeItem}
            >
              <X size={14} />
            </button>

            <Input
              label={ru.services.arrayEditor.blockTitle}
              value={block.title ?? ""}
              onChange={(e) => handleBlockChange(index, "title", e.target.value)}
              fullWidth
            />
            <Input
              label={ru.services.arrayEditor.blockLead}
              value={block.lead ?? ""}
              onChange={(e) => handleBlockChange(index, "lead", e.target.value)}
              fullWidth
            />
            <ArrayStringField
              label={ru.services.arrayEditor.blockItems}
              value={block.items ?? []}
              onChange={(items) => handleBlockChange(index, "items", items)}
              rows={1}
            />
          </div>
        ))}
      </div>

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={handleAdd}
        >
          {ru.services.arrayEditor.addBlock}
        </Button>
      </div>
    </div>
  );
}
