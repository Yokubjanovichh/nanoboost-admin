import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getOverview,
  getRevenueChart,
  getTopServices,
  getRecentOrders,
} from "@/features/dashboard/services/dashboard.api";

const KEYS = {
  overview: (period) => ["dashboard", "overview", period],
  revenueChart: (period, granularity) => [
    "dashboard",
    "revenue-chart",
    period,
    granularity,
  ],
  topServices: (period, limit) => ["dashboard", "top-services", period, limit],
  recentOrders: (limit) => ["dashboard", "recent-orders", limit],
};

const STALE = 30 * 1000;

export function useOverview(period) {
  return useQuery({
    queryKey: KEYS.overview(period),
    queryFn: () => getOverview(period),
    placeholderData: keepPreviousData,
    staleTime: STALE,
  });
}

export function useRevenueChart(period, granularity = "day") {
  return useQuery({
    queryKey: KEYS.revenueChart(period, granularity),
    queryFn: () => getRevenueChart(period, granularity),
    placeholderData: keepPreviousData,
    staleTime: STALE,
  });
}

export function useTopServices(period, limit = 5) {
  return useQuery({
    queryKey: KEYS.topServices(period, limit),
    queryFn: () => getTopServices(period, limit),
    placeholderData: keepPreviousData,
    staleTime: STALE,
  });
}

export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: KEYS.recentOrders(limit),
    queryFn: () => getRecentOrders(limit),
    staleTime: 15 * 1000,
  });
}
