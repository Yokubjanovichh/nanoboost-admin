import { apiClient } from "@/lib/api-client";

export async function listClients(params = {}) {
  const { data } = await apiClient.get("/clients", { params });
  return data;
}

export async function getClient(id) {
  const { data } = await apiClient.get(`/clients/${id}`);
  return data;
}

export async function listClientOrders(id, params = {}) {
  const { data } = await apiClient.get(`/clients/${id}/orders`, { params });
  return data;
}

export async function updateClient(id, payload) {
  const { data } = await apiClient.patch(`/clients/${id}`, payload);
  return data;
}
