import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listServiceOptions,
  createServiceOption,
  updateServiceOption,
  deleteServiceOption,
  setDefaultOption,
} from "@/features/services/services/services.api";

const KEYS = {
  options: (serviceId) => ["services", serviceId, "options"],
  serviceDetail: (serviceId) => ["services", "detail", serviceId],
};

export function useServiceOptions(serviceId) {
  return useQuery({
    queryKey: KEYS.options(serviceId),
    queryFn: () => listServiceOptions(serviceId),
    enabled: Boolean(serviceId),
  });
}

function invalidateOptions(queryClient, serviceId) {
  queryClient.invalidateQueries({ queryKey: KEYS.options(serviceId) });
  queryClient.invalidateQueries({ queryKey: KEYS.serviceDetail(serviceId) });
  queryClient.invalidateQueries({ queryKey: ["services", "list"] });
}

export function useCreateServiceOption(serviceId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createServiceOption(serviceId, payload),
    onSuccess: () => invalidateOptions(queryClient, serviceId),
  });
}

export function useUpdateServiceOption(serviceId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ optionId, payload }) => updateServiceOption(serviceId, optionId, payload),
    onSuccess: () => invalidateOptions(queryClient, serviceId),
  });
}

export function useDeleteServiceOption(serviceId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionId) => deleteServiceOption(serviceId, optionId),
    onSuccess: () => invalidateOptions(queryClient, serviceId),
  });
}

export function useSetDefaultOption(serviceId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionId) => setDefaultOption(serviceId, optionId),
    onMutate: async (optionId) => {
      await queryClient.cancelQueries({ queryKey: KEYS.options(serviceId) });
      const previous = queryClient.getQueryData(KEYS.options(serviceId));
      if (Array.isArray(previous)) {
        queryClient.setQueryData(
          KEYS.options(serviceId),
          previous.map((opt) => ({ ...opt, is_default: opt.id === optionId })),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(KEYS.options(serviceId), context.previous);
      }
    },
    onSettled: () => invalidateOptions(queryClient, serviceId),
  });
}
