import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  listClients,
  getClient,
  listClientOrders,
  updateClient,
} from "@/features/clients/services/clients.api";

const KEYS = {
  all: ["clients"],
  list: (params) => ["clients", "list", params],
  detail: (id) => ["clients", "detail", id],
  orders: (id, params) => ["clients", id, "orders", params],
};

export function useClientsList(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => listClients(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useClient(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getClient(id),
    enabled: Boolean(id),
  });
}

export function useClientOrders(id, params) {
  return useQuery({
    queryKey: KEYS.orders(id, params),
    queryFn: () => listClientOrders(id, params),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateClientNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => updateClient(id, { notes }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(KEYS.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
