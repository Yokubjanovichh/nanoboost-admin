import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  listOrders,
  getOrder,
  updateOrderStatus,
  updateOrder,
  getOrderStats,
} from "@/features/orders/services/orders.api";

const KEYS = {
  all: ["orders"],
  list: (params) => ["orders", "list", params],
  detail: (id) => ["orders", "detail", id],
  stats: (period) => ["orders", "stats", period],
};

export function useOrdersList(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => listOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, admin_notes }) =>
      updateOrderStatus(id, { status, admin_notes }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(KEYS.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdateOrderNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin_notes }) => updateOrder(id, { admin_notes }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(KEYS.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useOrderStats(period = "month") {
  return useQuery({
    queryKey: KEYS.stats(period),
    queryFn: () => getOrderStats(period),
  });
}
