import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  listReviews,
  getReview,
  createReview,
  updateReview,
  toggleReview,
  toggleReviewFeatured,
  deleteReview,
} from "@/features/reviews/services/reviews.api";

const KEYS = {
  all: ["reviews"],
  list: (params) => ["reviews", "list", params],
  detail: (id) => ["reviews", "detail", id],
};

export function useReviewsList(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => listReviews(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useReview(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getReview(id),
    enabled: Boolean(id),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createReview(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateReview(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(KEYS.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

function useOptimisticBoolFlip(field, mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEYS.all });
      const previousLists = queryClient.getQueriesData({ queryKey: ["reviews", "list"] });
      const previousDetail = queryClient.getQueryData(KEYS.detail(id));

      previousLists.forEach(([key, data]) => {
        if (!data?.items) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((item) =>
            item.id === id ? { ...item, [field]: !item[field] } : item,
          ),
        });
      });
      if (previousDetail) {
        queryClient.setQueryData(KEYS.detail(id), {
          ...previousDetail,
          [field]: !previousDetail[field],
        });
      }
      return { previousLists, previousDetail, id };
    },
    onError: (_err, _id, context) => {
      context?.previousLists?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.previousDetail) {
        queryClient.setQueryData(KEYS.detail(context.id), context.previousDetail);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useToggleReview() {
  return useOptimisticBoolFlip("is_active", (id) => toggleReview(id));
}

export function useToggleFeaturedReview() {
  return useOptimisticBoolFlip("is_featured", (id) => toggleReviewFeatured(id));
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
}
