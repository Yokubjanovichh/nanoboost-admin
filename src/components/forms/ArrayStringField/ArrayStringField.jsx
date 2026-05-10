import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { Button } from "@/components/ui/Button/Button";
import { ru } from "@/locales/ru";
import { cn } from "@/lib/utils";
import styles from "./ArrayStringField.module.css";

export function ArrayStringField({
  value,
  onChange,
  label,
  placeholder,
  rows = 2,
  addLabel,
  minItems = 0,
  className,
}) {
  const items = Array.isArray(value) ? value : [];

  const update = (next) => onChange?.(next);

  const handleItemChange = (index, newValue) => {
    const next = items.slice();
    next[index] = newValue;
    update(next);
  };

  const handleAdd = () => update([...items, ""]);

  const handleRemove = (index) => {
    if (items.length <= minItems) return;
    update(items.filter((_, i) => i !== index));
  };

  return (
    <div className={cn(styles.field, className)}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.list}>
        {items.length === 0 ? (
          <p className={styles.empty}>{ru.common.empty}</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className={styles.row}>
              <Textarea
                rows={rows}
                value={item ?? ""}
                placeholder={placeholder}
                onChange={(e) => handleItemChange(index, e.target.value)}
                fullWidth
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemove(index)}
                disabled={items.length <= minItems}
                aria-label={ru.services.arrayEditor.removeItem}
                title={ru.services.arrayEditor.removeItem}
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={handleAdd}
        >
          {addLabel ?? ru.services.arrayEditor.addItem}
        </Button>
      </div>
    </div>
  );
}
