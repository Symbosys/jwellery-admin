import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const adminAnalyticsKeys = {
  all: ["adminAnalytics"] as const,
  overview: (params?: Record<string, any>) => [...adminAnalyticsKeys.all, "overview", params] as const,
  performance: (params?: Record<string, any>) => [...adminAnalyticsKeys.all, "performance", params] as const,
  products: (params?: Record<string, any>) => [...adminAnalyticsKeys.all, "products", params] as const,
};

export const useAdminAnalyticsOverviewQuery = (params?: { range?: string; startDate?: string; endDate?: string }) => {
  return useQuery<AnalyticsOverview>({
    queryKey: adminAnalyticsKeys.overview(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: AnalyticsOverview }>("/admin/analytics/overview", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useAdminPerformanceChartQuery = (params?: { range?: string; startDate?: string; endDate?: string }) => {
  return useQuery<PerformanceChartItem[]>({
    queryKey: adminAnalyticsKeys.performance(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: PerformanceChartItem[] }>("/admin/analytics/performance", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useAdminProductAnalyticsQuery = (params?: { limit?: number; sortBy?: string }) => {
  return useQuery<ProductAnalyticsItem[]>({
    queryKey: adminAnalyticsKeys.products(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: ProductAnalyticsItem[] }>("/admin/analytics/products", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export interface PaymentsOverview {
  stats: {
    label: string;
    value: string;
    change: number | null;
  }[];
  earningsData: {
    month: string;
    earnings: number;
  }[];
}

export interface PaymentTransaction {
  id: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  date: string;
  status: "completed" | "processing" | "pending" | "failed";
}

export const adminPaymentsKeys = {
  all: ["adminPayments"] as const,
  overview: () => [...adminPaymentsKeys.all, "overview"] as const,
  transactions: (params?: Record<string, any>) => [...adminPaymentsKeys.all, "transactions", params] as const,
};

export const useAdminPaymentsOverviewQuery = () => {
  return useQuery<PaymentsOverview>({
    queryKey: adminPaymentsKeys.overview(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: PaymentsOverview }>("/admin/payments/overview");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useAdminTransactionsQuery = (params?: { limit?: number }) => {
  return useQuery<PaymentTransaction[]>({
    queryKey: adminPaymentsKeys.transactions(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: PaymentTransaction[] }>("/admin/payments/transactions", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export interface PickupAddress {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isPrimary: boolean;
}

export interface WebConfig {
  id: string;
  storeName: string;
  businessEmail: string;
  phoneNumber: string;
  website: string | null;
  storeDescription: string | null;
  logo: string | null;

  bankName: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  routingNumber: string | null;

  gstNumber: string | null;
  panNumber: string | null;
  registeredBusinessName: string | null;

  pickupAddresses: PickupAddress[] | null;

  createdAt: string;
  updatedAt: string;
}

export const adminSettingsKeys = {
  all: ["adminSettings"] as const,
};

export const useAdminSettingsQuery = () => {
  return useQuery<WebConfig>({
    queryKey: adminSettingsKeys.all,
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: WebConfig }>("/admin/settings");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAdminSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData | Partial<WebConfig>) => {
      const response = await apiClient.put<{ success: boolean; data: WebConfig }>("/admin/settings", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsKeys.all });
    },
  });
};

// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Types & Hooks
// ──────────────────────────────────────────────────────────────────────────────

export interface DashboardStatDetail {
  value: number;
  change: number;
}

export interface DashboardStats {
  totalOrders: DashboardStatDetail;
  totalSales: DashboardStatDetail;
  pendingOrders: DashboardStatDetail;
  completedOrders: DashboardStatDetail;
  cancelledOrders: DashboardStatDetail;
  totalProducts: DashboardStatDetail;
  lowStockItems: DashboardStatDetail;
  returnRequests: DashboardStatDetail;
}

export interface SalesChartData {
  name: string;
  sales: number;
  orders: number;
}

export interface OrdersBreakdownData {
  name: string;
  value: number;
  color: string;
}

export interface DashboardCharts {
  salesOverview: SalesChartData[];
  ordersBreakdown: OrdersBreakdownData[];
}

export interface DashboardRecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: string;
  date: string;
}

export interface DashboardAlert {
  id: number;
  type: "warning" | "error" | "info";
  title: string;
  description: string;
  action: string;
}

export const adminDashboardKeys = {
  all: ["adminDashboard"] as const,
  stats: () => [...adminDashboardKeys.all, "stats"] as const,
  charts: () => [...adminDashboardKeys.all, "charts"] as const,
  recentOrders: () => [...adminDashboardKeys.all, "recentOrders"] as const,
  alerts: () => [...adminDashboardKeys.all, "alerts"] as const,
};

export const useAdminDashboardStatsQuery = () => {
  return useQuery<DashboardStats>({
    queryKey: adminDashboardKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DashboardStats }>("/admin/dashboard/stats");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useAdminDashboardChartsQuery = () => {
  return useQuery<DashboardCharts>({
    queryKey: adminDashboardKeys.charts(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DashboardCharts }>("/admin/dashboard/charts");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useAdminDashboardRecentOrdersQuery = () => {
  return useQuery<DashboardRecentOrder[]>({
    queryKey: adminDashboardKeys.recentOrders(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DashboardRecentOrder[] }>("/admin/dashboard/recent-orders");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useAdminDashboardAlertsQuery = () => {
  return useQuery<DashboardAlert[]>({
    queryKey: adminDashboardKeys.alerts(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DashboardAlert[] }>("/admin/dashboard/alerts");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

