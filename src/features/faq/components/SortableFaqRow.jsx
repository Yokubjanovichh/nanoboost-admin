import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/Switch/Switch";
import { useToggleFaqActive } from "@/features/faq/hooks/useFaqs";
import { useCanManageFaqs } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/Toast/Toast";
import { FaqActions } from "@/features/faq/components/FaqActions";
import { ru } from "@/locales/ru";
import styles from "./SortableFaqRow.module.css";

function truncate(s, n = 60) {
  if (!s) return "";
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function SortableFaqRow({ faq, index, gameSlug, onEdit, disabled }) {
  const canManage = useCanManageFaqs();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id, disabled: disabled || !canManage });

  const toggle = useToggleFaqActive(gameSlug);
  const toast = useToast();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleSwitch = (checked) => {
    toggle.mutate(
      { id: faq.id, nextValue: checked },
      {
        onSuccess: () =>
          toast.success(checked ? ru.faqs.toasts.enabled : ru.faqs.toasts.disabled),
        onError: () => toast.error(ru.common.error, ru.faqs.toasts.error),
      },
    );
  };

  const truncated = truncate(faq.question, 60);
  const isLong = faq.question && faq.question.length > 60;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={styles.row}
      data-dragging={isDragging || undefined}
    >
      <td className={styles.handleCell}>
        {canManage ? (
          <button
            type="button"
            className={styles.handle}
            aria-label={ru.faqs.dragHandle}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
        ) : (
          <span className={styles.handlePlaceholder} aria-hidden="true">
            <GripVertical size={16} />
          </span>
        )}
      </td>
      <td className={styles.indexCell}>{index + 1}</td>
      <td className={styles.questionCell}>
        <span
          className={styles.questionText}
          title={isLong ? faq.question : undefined}
        >
          {truncated}
        </span>
      </td>
      <td className={styles.activeCell}>
        <Switch
          checked={Boolean(faq.is_active)}
          onCheckedChange={canManage ? handleSwitch : undefined}
          disabled={!canManage || toggle.isPending}
          aria-label={ru.faqs.fields.isActive}
        />
      </td>
      <td className={styles.actionsCell}>
        <FaqActions faq={faq} gameSlug={gameSlug} onEdit={onEdit} />
      </td>
    </tr>
  );
}
