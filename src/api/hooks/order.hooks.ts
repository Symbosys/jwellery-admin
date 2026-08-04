import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productImage: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface DBOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED" | "FAILED";
  paymentMethod: string | null;
  subtotal: string | number;
  discount: string | number;
  shippingCharge: string | number;
  tax: string | number;
  totalAmount: string | number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  note: string | null;
  placedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: DBOrderItem[];
  longitude?: string | null;
  latitude?: string | null;
  addressId?: string | null;
  address?: {
    id: string;
    name: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    locality?: string | null;
    longitude?: number | null;
    latitude?: number | null;
    type?: string;
  } | null;
}

export const orderKeys = {
  all: ["orders"] as const,
  list: (params?: Record<string, any>) => [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export const useOrdersQuery = (params?: Record<string, any>) => {
  return useQuery<DBOrder[]>({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBOrder[] }>("/order", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useOrderDetailQuery = (id: string, enabled = true) => {
  return useQuery<DBOrder>({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBOrder }>(`/order/${id}`);
      return response.data.data;
    },
    enabled: enabled && !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DBOrder["status"] }) => {
      const response = await apiClient.put<{ success: boolean; data: DBOrder }>(`/order/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
    },
  });
};

export const useUpdateOrderPaymentStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: DBOrder["paymentStatus"] }) => {
      const response = await apiClient.put<{ success: boolean; data: DBOrder }>(`/order/${id}/payment`, { paymentStatus });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
    },
  });
};

export interface UpdateOrderAddressInput {
  orderId: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingAddress2?: string;
  shippingCity: string;
  shippingState: string;
  shippingCountry?: string;
  shippingPincode: string;
}

export const useUpdateOrderAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<DBOrder, Error, UpdateOrderAddressInput>({
    mutationFn: async (data) => {
      const { orderId, ...addressData } = data;
      const response = await apiClient.put<{ success: boolean; data: { order: DBOrder } | DBOrder }>(
        `/order/${orderId}/address`,
        addressData
      );
      const resData = response.data.data;
      return "order" in resData ? (resData as { order: DBOrder }).order : (resData as DBOrder);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      }
    },
  });
};

export interface ReturnOrderInput {
  orderId: string;
  reason?: string;
}

export const useReturnOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<DBOrder, Error, ReturnOrderInput>({
    mutationFn: async ({ orderId, reason }) => {
      const response = await apiClient.put<{ success: boolean; data: { order: DBOrder } | DBOrder }>(
        `/order/${orderId}/return`,
        { reason }
      );
      const resData = response.data.data;
      return "order" in resData ? (resData as { order: DBOrder }).order : (resData as DBOrder);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      }
    },
  });
};

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<DBOrder, Error, string>({
    mutationFn: async (id: string) => {
      const response = await apiClient.put<{ success: boolean; data: DBOrder }>(`/order/${id}/cancel`);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      }
    },
  });
};



