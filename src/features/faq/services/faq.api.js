import { apiClient } from "@/lib/api-client";

// FAQ endpoints live under /admin (vs other admin features that omit the
// prefix). BE engineer chose this layout for the per-game nested resource;
// the FE only needs to use the right paths.

export async function listGameFaqs(gameSlug) {
  const { data } = await apiClient.get(`/admin/games/${gameSlug}/faqs`);
  return Array.isArray(data) ? data : Array.isArray(data?.faqs) ? data.faqs : [];
}

export async function createFaq(gameSlug, payload) {
  const { data } = await apiClient.post(`/admin/games/${gameSlug}/faqs`, payload);
  return data;
}

export async function updateFaq(id, payload) {
  const { data } = await apiClient.patch(`/admin/faqs/${id}`, payload);
  return data;
}

export async function deleteFaq(id) {
  const { data } = await apiClient.delete(`/admin/faqs/${id}`);
  return data;
}

export async function reorderFaqs(gameSlug, order) {
  // order: [{ id, order_index }, ...]
  const { data } = await apiClient.post(
    `/admin/games/${gameSlug}/faqs/reorder`,
    { order },
  );
  return data;
}
