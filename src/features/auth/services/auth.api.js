import { apiClient } from "@/lib/api-client";

export async function login(credentials) {
  const { data } = await apiClient.post("/auth/login", credentials);
  return data;
}

export async function refresh(refreshToken) {
  const { data } = await apiClient.post("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function logoutApi() {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // ignore — client-side logout proceeds regardless
  }
}
