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
  useDeleteReview,
  useToggleReview,
  useToggleFeaturedReview,
} from "@/features/reviews/hooks/useReviews";
import { useCanDeleteReviews, useCanManageReviews } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/Toast/Toast";
import { ru } from "@/locales/ru";

export function ReviewActions({ review }) {
  const navigate = useNavigate();
  const canManage = useCanManageReviews();
  const canDelete = useCanDeleteReviews();
  const toggleMutation = useToggleReview();
  const featuredMutation = useToggleFeaturedReview();
  const deleteMutation = useDeleteReview();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleToggleActive = () => {
    toggleMutation.mutate(review.id, {
      onSuccess: () =>
        toast.success(
          review.is_active ? ru.reviews.toasts.disabled : ru.reviews.toasts.enabled,
        ),
      onError: () => toast.error(ru.common.error, ru.reviews.toasts.error),
    });
  };

  const handleToggleFeatured = () => {
    featuredMutation.mutate(review.id, {
      onSuccess: () =>
        toast.success(
          review.is_featured ? ru.reviews.toasts.unfeatured : ru.reviews.toasts.featured,
        ),
      onError: () => toast.error(ru.common.error, ru.reviews.toasts.error),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(review.id, {
      onSuccess: () => {
        toast.success(ru.reviews.toasts.deleted);
        setConfirmOpen(false);
      },
      onError: () => toast.error(ru.common.error, ru.reviews.toasts.error),
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
          <DropdownMenuItem onSelect={() => navigate(`/reviews/${review.id}/edit`)}>
            <Edit3 size={14} />
            {ru.reviews.actions.edit}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleFeatured}>
            {review.is_featured ? <StarOff size={14} /> : <Star size={14} />}
            {review.is_featured
              ? ru.reviews.actions.removeFeatured
              : ru.reviews.actions.makeFeatured}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleActive}>
            {review.is_active ? <PowerOff size={14} /> : <Power size={14} />}
            {review.is_active ? ru.reviews.actions.disable : ru.reviews.actions.enable}
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem danger onSelect={() => setConfirmOpen(true)}>
                <Trash2 size={14} />
                {ru.reviews.actions.delete}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={ru.reviews.deleteConfirm.title}
        description={ru.reviews.deleteConfirm.description.replace(
          "{author}",
          review.author_name,
        )}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
