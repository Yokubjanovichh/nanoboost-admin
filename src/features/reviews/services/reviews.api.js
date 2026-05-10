import { apiClient } from "@/lib/api-client";

export async function listReviews(params = {}) {
  const { data } = await apiClient.get("/reviews", { params });
  return data;
}

export async function getReview(id) {
  const { data } = await apiClient.get(`/reviews/${id}`);
  return data;
}

export async function createReview(payload) {
  const { data } = await apiClient.post("/reviews", payload);
  return data;
}

export async function updateReview(id, payload) {
  const { data } = await apiClient.patch(`/reviews/${id}`, payload);
  return data;
}

export async function toggleReview(id) {
  const { data } = await apiClient.patch(`/reviews/${id}/toggle`);
  return data;
}

export async function toggleReviewFeatured(id) {
  const { data } = await apiClient.patch(`/reviews/${id}/featured`);
  return data;
}

export async function deleteReview(id) {
  const { data } = await apiClient.delete(`/reviews/${id}`);
  return data;
}
