import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import { ArrayStringField } from "@/components/forms/ArrayStringField/ArrayStringField";
import { ru } from "@/locales/ru";
import { cn } from "@/lib/utils";
import styles from "./SectionsEditor.module.css";

const emptySection = () => ({ title: "", texts: [] });

export function SectionsEditor({ value, onChange, label, className }) {
  const sections = Array.isArray(value) ? value : [];

  const update = (next) => onChange?.(next);

  const handleSectionChange = (index, key, newValue) => {
    const next = sections.map((s, i) => (i === index ? { ...s, [key]: newValue } : s));
    update(next);
  };

  const handleAdd = () => update([...sections, emptySection()]);

  const handleRemove = (index) => update(sections.filter((_, i) => i !== index));

  return (
    <div className={cn(styles.field, className)}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.list}>
        {sections.map((section, index) => (
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
              value={section.title ?? ""}
              onChange={(e) => handleSectionChange(index, "title", e.target.value)}
              fullWidth
            />
            <ArrayStringField
              label="Параграфы"
              value={section.texts ?? []}
              onChange={(texts) => handleSectionChange(index, "texts", texts)}
              rows={2}
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
          {ru.services.arrayEditor.addSection}
        </Button>
      </div>
    </div>
  );
}
