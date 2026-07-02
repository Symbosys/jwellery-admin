import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface AnalyticsMetricDetail {
  value: string | number;
  trend: number;
  description: string;
}

export interface AnalyticsOverview {
  metrics: {
    sales: AnalyticsMetricDetail;
    orders: AnalyticsMetricDetail;
    rating: AnalyticsMetricDetail;
    delivery: AnalyticsMetricDetail;
    cancellation: AnalyticsMetricDetail;
    responseTime: AnalyticsMetricDetail;
  };
  ratingBreakdown: {
    stars: number;
    count: number;
    percentage: number;
  }[];
  totalReviews: number;
}

export interface PerformanceChartItem {
  month: string;
  orders: number;
  returns: number;
}

export interface ProductAnalyticsItem {
  id: string;
  name: string;
  image: string;
  price: string | number;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number | string;
}

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (params?: Record<string, any>) => [...analyticsKeys.all, "overview", params] as const,
  performance: (params?: Record<string, any>) => [...analyticsKeys.all, "performance", params] as const,
  products: (params?: Record<string, any>) => [...analyticsKeys.all, "products", params] as const,
};

export const useAnalyticsOverviewQuery = (params?: { range?: string; startDate?: string; endDate?: string }) => {
  return useQuery<AnalyticsOverview>({
    queryKey: analyticsKeys.overview(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: AnalyticsOverview }>("/analytics/overview", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePerformanceChartQuery = (params?: { range?: string; startDate?: string; endDate?: string }) => {
  return useQuery<PerformanceChartItem[]>({
    queryKey: analyticsKeys.performance(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: PerformanceChartItem[] }>("/analytics/performance", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useProductAnalyticsQuery = (params?: { limit?: number; sortBy?: string }) => {
  return useQuery<ProductAnalyticsItem[]>({
    queryKey: analyticsKeys.products(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: ProductAnalyticsItem[] }>("/analytics/products", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useTrackEventMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      eventType: "VIEW" | "ADD_TO_CART" | "PURCHASE";
      quantity?: number;
      amount?: number;
    }) => {
      const response = await apiClient.post<{ success: boolean; data: any }>("/analytics/track", payload);
      return response.data.data;
    },
  });
};
