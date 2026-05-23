import { useState } from "react";
import { MoreVertical, Edit3, Power, PowerOff, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu/DropdownMenu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/ui/Toast/Toast";
import {
  useDeleteFaq,
  useToggleFaqActive,
} from "@/features/faq/hooks/useFaqs";
import {
  useCanDeleteFaqs,
  useCanManageFaqs,
} from "@/features/auth/hooks/useAuth";
import { ru } from "@/locales/ru";

function truncate(s, n = 60) {
  if (!s) return "";
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function FaqActions({ faq, gameSlug, onEdit }) {
  const canManage = useCanManageFaqs();
  const canDelete = useCanDeleteFaqs();
  const toggle = useToggleFaqActive(gameSlug);
  const remove = useDeleteFaq(gameSlug);
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!canManage) return null;

  const handleToggleActive = () => {
    const next = !faq.is_active;
    toggle.mutate(
      { id: faq.id, nextValue: next },
      {
        onSuccess: () =>
          toast.success(next ? ru.faqs.toasts.enabled : ru.faqs.toasts.disabled),
        onError: () => toast.error(ru.common.error, ru.faqs.toasts.error),
      },
    );
  };

  const handleDelete = () => {
    remove.mutate(faq.id, {
      onSuccess: () => {
        toast.success(ru.faqs.toasts.deleted);
        setConfirmOpen(false);
      },
      onError: () => toast.error(ru.common.error, ru.faqs.toasts.error),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={ru.common.actions}
            style={{
              width: 32,
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-md)",
              background: "transparent",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
            }}
          >
            <MoreVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => onEdit?.(faq)}>
            <Edit3 size={14} />
            {ru.faqs.actions.edit}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleActive}>
            {faq.is_active ? <PowerOff size={14} /> : <Power size={14} />}
            {faq.is_active ? ru.faqs.actions.disable : ru.faqs.actions.enable}
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem danger onSelect={() => setConfirmOpen(true)}>
                <Trash2 size={14} />
                {ru.faqs.actions.delete}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={ru.faqs.deleteConfirm.title}
        description={ru.faqs.deleteConfirm.description.replace(
          "{question}",
          truncate(faq.question, 60),
        )}
        onConfirm={handleDelete}
        loading={remove.isPending}
      />
    </>
  );
}
