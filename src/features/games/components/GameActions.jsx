import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Edit3, Power, PowerOff, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu/DropdownMenu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { useDeleteGame, useToggleGame } from "@/features/games/hooks/useGames";
import { useCanDeleteGames, useCanManageGames } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/Toast/Toast";
import { ru } from "@/locales/ru";

export function GameActions({ game }) {
  const navigate = useNavigate();
  const canManage = useCanManageGames();
  const canDelete = useCanDeleteGames();
  const toggleMutation = useToggleGame();
  const deleteMutation = useDeleteGame();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleToggle = () => {
    toggleMutation.mutate(game.id, {
      onSuccess: () =>
        toast.success(
          game.is_active ? ru.games.toasts.disabled : ru.games.toasts.enabled,
        ),
      onError: () => toast.error(ru.common.error, ru.games.toasts.error),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(game.id, {
      onSuccess: () => {
        toast.success(ru.games.toasts.deleted);
        setConfirmOpen(false);
      },
      onError: () => toast.error(ru.common.error, ru.games.toasts.error),
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
          <DropdownMenuItem onSelect={() => navigate(`/games/${game.id}/edit`)}>
            <Edit3 size={14} />
            {ru.games.actions.edit}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggle}>
            {game.is_active ? <PowerOff size={14} /> : <Power size={14} />}
            {game.is_active ? ru.games.actions.disable : ru.games.actions.enable}
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem danger onSelect={() => setConfirmOpen(true)}>
                <Trash2 size={14} />
                {ru.games.actions.delete}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={ru.games.deleteConfirm.title}
        description={ru.games.deleteConfirm.description.replace("{name}", game.name)}
        confirmLabel={ru.games.deleteConfirm.confirm}
        cancelLabel={ru.games.deleteConfirm.cancel}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
