import { apiClient } from "@/lib/api-client";

export async function getOverview(period = "month") {
  const { data } = await apiClient.get("/dashboard/overview", { params: { period } });
  return data;
}

export async function getRevenueChart(period = "month", granularity = "day") {
  const { data } = await apiClient.get("/dashboard/revenue-chart", {
    params: { period, granularity },
  });
  return data;
}

export async function getTopServices(period = "month", limit = 5) {
  const { data } = await apiClient.get("/dashboard/top-services", {
    params: { period, limit },
  });
  return data;
}

export async function getRecentOrders(limit = 10) {
  const { data } = await apiClient.get("/dashboard/recent-orders", {
    params: { limit },
  });
  return data;
}
