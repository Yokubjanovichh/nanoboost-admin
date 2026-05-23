import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listGameFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
} from "@/features/faq/services/faq.api";

const KEYS = {
  all: ["faqs"],
  byGame: (slug) => ["faqs", "byGame", slug],
};

export function useGameFaqs(gameSlug) {
  return useQuery({
    queryKey: KEYS.byGame(gameSlug),
    queryFn: () => listGameFaqs(gameSlug),
    enabled: Boolean(gameSlug),
    staleTime: 15 * 1000,
  });
}

export function useCreateFaq(gameSlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createFaq(gameSlug, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.byGame(gameSlug) }),
  });
}

export function useUpdateFaq(gameSlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateFaq(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.byGame(gameSlug) }),
  });
}

// is_active flip uses the generic update endpoint — PATCH /admin/faqs/{id}
// with { is_active: !current }. Optimistic so the Switch feels instant.
export function useToggleFaqActive(gameSlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nextValue }) =>
      updateFaq(id, { is_active: nextValue }),
    onMutate: async ({ id, nextValue }) => {
      await queryClient.cancelQueries({ queryKey: KEYS.byGame(gameSlug) });
      const previous = queryClient.getQueryData(KEYS.byGame(gameSlug));
      if (Array.isArray(previous)) {
        queryClient.setQueryData(
          KEYS.byGame(gameSlug),
          previous.map((f) => (f.id === id ? { ...f, is_active: nextValue } : f)),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(KEYS.byGame(gameSlug), context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEYS.byGame(gameSlug) }),
  });
}

export function useDeleteFaq(gameSlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteFaq(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.byGame(gameSlug) }),
  });
}

// Reorder is the most disruptive optimistic update — the DOM has already
// moved to the new positions thanks to dnd-kit, so we mirror that into the
// cache straight away and only fall back to the previous order on error.
export function useReorderFaqs(gameSlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order) => reorderFaqs(gameSlug, order),
    onMutate: async (order) => {
      await queryClient.cancelQueries({ queryKey: KEYS.byGame(gameSlug) });
      const previous = queryClient.getQueryData(KEYS.byGame(gameSlug));
      if (Array.isArray(previous)) {
        const orderMap = new Map(order.map((o) => [o.id, o.order_index]));
        const next = previous
          .map((f) => ({
            ...f,
            order_index: orderMap.has(f.id) ? orderMap.get(f.id) : f.order_index,
          }))
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        queryClient.setQueryData(KEYS.byGame(gameSlug), next);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(KEYS.byGame(gameSlug), context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEYS.byGame(gameSlug) }),
  });
}
