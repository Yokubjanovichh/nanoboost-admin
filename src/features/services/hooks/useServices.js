import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  listServices,
  getService,
  createService,
  updateService,
  toggleService,
  toggleFeatured,
  deleteService,
} from "@/features/services/services/services.api";

const KEYS = {
  all: ["services"],
  list: (params) => ["services", "list", params],
  detail: (id) => ["services", "detail", id],
};

export function useServicesList(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => listServices(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useService(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getService(id),
    enabled: Boolean(id),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createService(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateService(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(KEYS.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

function useOptimisticBoolFlip(field) {
  const queryClient = useQueryClient();
  return {
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEYS.all });
      const previousLists = queryClient.getQueriesData({ queryKey: ["services", "list"] });
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
  };
}

export function useToggleService() {
  const optimistic = useOptimisticBoolFlip("is_active");
  return useMutation({ mutationFn: (id) => toggleService(id), ...optimistic });
}

export function useToggleFeatured() {
  const optimistic = useOptimisticBoolFlip("is_featured");
  return useMutation({ mutationFn: (id) => toggleFeatured(id), ...optimistic });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
}
