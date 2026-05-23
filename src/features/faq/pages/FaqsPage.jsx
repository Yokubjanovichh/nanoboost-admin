import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Button } from "@/components/ui/Button/Button";
import { GameSelect } from "@/components/forms/GameSelect/GameSelect";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { useToast } from "@/components/ui/Toast/Toast";
import { useGamesList } from "@/features/games/hooks/useGames";
import {
  useGameFaqs,
  useCreateFaq,
  useUpdateFaq,
  useReorderFaqs,
} from "@/features/faq/hooks/useFaqs";
import { useCanManageFaqs } from "@/features/auth/hooks/useAuth";
import { FaqDialog } from "@/features/faq/components/FaqDialog";
import { SortableFaqRow } from "@/features/faq/components/SortableFaqRow";
import { ru } from "@/locales/ru";
import styles from "./FaqsPage.module.css";

export function FaqsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedGameId = searchParams.get("game") || "";
  const canManage = useCanManageFaqs();
  const toast = useToast();

  const { data: gamesData, isLoading: gamesLoading } = useGamesList({
    page_size: 100,
    is_active: true,
  });
  const games = useMemo(() => gamesData?.items ?? [], [gamesData]);

  // Default to the first game once the list loads, so the page is never
  // sitting empty waiting for a manual selection.
  useEffect(() => {
    if (!selectedGameId && games.length > 0) {
      const sp = new URLSearchParams(searchParams);
      sp.set("game", games[0].id);
      setSearchParams(sp, { replace: true });
    }
  }, [selectedGameId, games, searchParams, setSearchParams]);

  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) || null,
    [games, selectedGameId],
  );
  const gameSlug = selectedGame?.slug || "";

  const {
    data: faqs,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGameFaqs(gameSlug);

  const sorted = useMemo(() => {
    const list = Array.isArray(faqs) ? faqs : [];
    return list
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [faqs]);

  const createMutation = useCreateFaq(gameSlug);
  const updateMutation = useUpdateFaq(gameSlug);
  const reorderMutation = useReorderFaqs(gameSlug);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const openCreate = () => {
    setEditingFaq(null);
    setDialogOpen(true);
  };

  const openEdit = (faq) => {
    setEditingFaq(faq);
    setDialogOpen(true);
  };

  const handleSubmit = (payload) => {
    // Newly created FAQs land at the end of the list — using max(order)+1
    // means dragged-around items don't get jumbled by manual indexes.
    const nextOrder = sorted.length
      ? Math.max(...sorted.map((f) => Number(f.order_index) || 0)) + 1
      : 0;
    if (editingFaq) {
      updateMutation.mutate(
        { id: editingFaq.id, payload },
        {
          onSuccess: () => {
            toast.success(ru.faqs.toasts.updated);
            setDialogOpen(false);
          },
          onError: () => toast.error(ru.common.error, ru.faqs.toasts.error),
        },
      );
    } else {
      createMutation.mutate(
        { ...payload, order_index: nextOrder },
        {
          onSuccess: () => {
            toast.success(ru.faqs.toasts.created);
            setDialogOpen(false);
          },
          onError: () => toast.error(ru.common.error, ru.faqs.toasts.error),
        },
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((f) => f.id === active.id);
    const newIndex = sorted.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(sorted, oldIndex, newIndex);
    const order = reordered.map((f, idx) => ({ id: f.id, order_index: idx }));
    reorderMutation.mutate(order, {
      onSuccess: () => toast.success(ru.faqs.toasts.reordered),
      onError: () => toast.error(ru.common.error, ru.faqs.toasts.error),
    });
  };

  const onGameChange = (id) => {
    const sp = new URLSearchParams(searchParams);
    if (id) sp.set("game", id);
    else sp.delete("game");
    setSearchParams(sp);
  };

  const showSpinner = isLoading || (isFetching && !faqs);
  const showEmpty = !showSpinner && sorted.length === 0 && !isError;
  const submitLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <PageHeader
        title={ru.faqs.title}
        action={
          canManage && gameSlug ? (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={openCreate}
            >
              {ru.faqs.create}
            </Button>
          ) : null
        }
      />

      <div className={styles.filters}>
        <div className={styles.gameSelectWrap}>
          <GameSelect
            label={ru.faqs.gameSelector}
            value={selectedGameId}
            onChange={onGameChange}
            disabled={gamesLoading}
          />
        </div>
      </div>

      {isError ? (
        <EmptyState
          title={ru.common.error}
          description={error?.message ?? ""}
          action={
            <Button variant="primary" onClick={() => refetch()}>
              {ru.common.retry}
            </Button>
          }
        />
      ) : showSpinner ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : showEmpty ? (
        <EmptyState
          title={ru.faqs.empty}
          action={
            canManage && gameSlug ? (
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={openCreate}
              >
                {ru.faqs.emptyAction}
              </Button>
            ) : null
          }
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.handleHead} aria-hidden="true"></th>
                <th className={styles.indexHead}>{ru.faqs.columns.order}</th>
                <th>{ru.faqs.columns.question}</th>
                <th className={styles.activeHead}>{ru.faqs.columns.active}</th>
                <th className={styles.actionsHead}>
                  <span className="sr-only">{ru.faqs.columns.actions}</span>
                </th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sorted.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {sorted.map((faq, idx) => (
                    <SortableFaqRow
                      key={faq.id}
                      faq={faq}
                      index={idx}
                      gameSlug={gameSlug}
                      onEdit={openEdit}
                      disabled={reorderMutation.isPending}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      )}

      <FaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faq={editingFaq}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />
    </>
  );
}
