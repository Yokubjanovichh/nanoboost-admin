import { apiClient } from "@/lib/api-client";

export async function listGames(params = {}) {
  const { data } = await apiClient.get("/games", { params });
  return data;
}

export async function getGame(id) {
  const { data } = await apiClient.get(`/games/${id}`);
  return data;
}

export async function createGame(payload) {
  const { data } = await apiClient.post("/games", payload);
  return data;
}

export async function updateGame(id, payload) {
  const { data } = await apiClient.patch(`/games/${id}`, payload);
  return data;
}

export async function toggleGame(id) {
  const { data } = await apiClient.patch(`/games/${id}/toggle`);
  return data;
}

export async function deleteGame(id) {
  const { data } = await apiClient.delete(`/games/${id}`);
  return data;
}

export async function reorderGames(orderedIds) {
  const { data } = await apiClient.post("/games/reorder", { ids: orderedIds });
  return data;
}

export async function uploadFile({ file, folder = "misc" }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const { data } = await apiClient.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
