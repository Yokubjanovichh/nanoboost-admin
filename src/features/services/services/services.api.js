import { apiClient } from "@/lib/api-client";

export async function listServices(params = {}) {
  const { data } = await apiClient.get("/services", { params });
  return data;
}

export async function getService(id) {
  const { data } = await apiClient.get(`/services/${id}`);
  return data;
}

export async function createService(payload) {
  const { data } = await apiClient.post("/services", payload);
  return data;
}

export async function updateService(id, payload) {
  const { data } = await apiClient.patch(`/services/${id}`, payload);
  return data;
}

export async function toggleService(id) {
  const { data } = await apiClient.patch(`/services/${id}/toggle`);
  return data;
}

export async function toggleFeatured(id) {
  const { data } = await apiClient.patch(`/services/${id}/featured`);
  return data;
}

export async function deleteService(id) {
  const { data } = await apiClient.delete(`/services/${id}`);
  return data;
}

export async function listServiceOptions(serviceId) {
  const { data } = await apiClient.get(`/services/${serviceId}/options`);
  return data;
}

export async function createServiceOption(serviceId, payload) {
  const { data } = await apiClient.post(`/services/${serviceId}/options`, payload);
  return data;
}

export async function updateServiceOption(serviceId, optionId, payload) {
  const { data } = await apiClient.patch(`/services/${serviceId}/options/${optionId}`, payload);
  return data;
}

export async function deleteServiceOption(serviceId, optionId) {
  const { data } = await apiClient.delete(`/services/${serviceId}/options/${optionId}`);
  return data;
}

export async function setDefaultOption(serviceId, optionId) {
  const { data } = await apiClient.patch(`/services/${serviceId}/options/${optionId}`, {
    is_default: true,
  });
  return data;
}
