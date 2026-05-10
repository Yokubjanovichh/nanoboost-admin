import { apiClient } from "@/lib/api-client";

export async function listOrders(params = {}) {
  const { data } = await apiClient.get("/orders", { params });
  return data;
}

export async function getOrder(id) {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id, payload) {
  const { data } = await apiClient.patch(`/orders/${id}/status`, payload);
  return data;
}

export async function updateOrder(id, payload) {
  const { data } = await apiClient.patch(`/orders/${id}`, payload);
  return data;
}

export async function getOrderStats(period = "month") {
  const { data } = await apiClient.get("/orders/stats", { params: { period } });
  return data;
}
