import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Edit3, Power, PowerOff, Star, StarOff, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu/DropdownMenu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import {
  useDeleteService,
  useToggleFeatured,
  useToggleService,
} from "@/features/services/hooks/useServices";
import { useCanDeleteGames, useCanManageGames } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/Toast/Toast";
import { ru } from "@/locales/ru";

export function ServiceActions({ service }) {
  const navigate = useNavigate();
  const canManage = useCanManageGames();
  const canDelete = useCanDeleteGames();
  const toggleMutation = useToggleService();
  const featuredMutation = useToggleFeatured();
  const deleteMutation = useDeleteService();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleToggleActive = () => {
    toggleMutation.mutate(service.id, {
      onSuccess: () =>
        toast.success(
          service.is_active ? ru.services.toasts.disabled : ru.services.toasts.enabled,
        ),
      onError: () => toast.error(ru.common.error, ru.services.toasts.error),
    });
  };

  const handleToggleFeatured = () => {
    featuredMutation.mutate(service.id, {
      onSuccess: () =>
        toast.success(
          service.is_featured ? ru.services.toasts.unfeatured : ru.services.toasts.featured,
        ),
      onError: () => toast.error(ru.common.error, ru.services.toasts.error),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(service.id, {
      onSuccess: () => {
        toast.success(ru.services.toasts.deleted);
        setConfirmOpen(false);
      },
      onError: () => toast.error(ru.common.error, ru.services.toasts.error),
    });
  };

  if (!canManage) return null;

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
          <DropdownMenuItem onSelect={() => navigate(`/services/${service.id}/edit`)}>
            <Edit3 size={14} />
            {ru.services.actions.edit}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleFeatured}>
            {service.is_featured ? <StarOff size={14} /> : <Star size={14} />}
            {service.is_featured
              ? ru.services.actions.removeFeatured
              : ru.services.actions.makeFeatured}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleActive}>
            {service.is_active ? <PowerOff size={14} /> : <Power size={14} />}
            {service.is_active ? ru.services.actions.disable : ru.services.actions.enable}
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem danger onSelect={() => setConfirmOpen(true)}>
                <Trash2 size={14} />
                {ru.services.actions.delete}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={ru.services.deleteConfirm.title}
        description={ru.services.deleteConfirm.description.replace("{title}", service.title)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
