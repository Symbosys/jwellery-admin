import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const couponKeys = {
  all: ["coupons"] as const,
  list: () => [...couponKeys.all, "list"] as const,
};

export const useCouponsQuery = () => {
  return useQuery<DBCoupon[]>({
    queryKey: couponKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBCoupon[] }>("/coupon");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCoupon: Partial<DBCoupon>) => {
      const response = await apiClient.post<{ success: boolean; data: DBCoupon }>("/coupon", newCoupon);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
};

export const useUpdateCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DBCoupon> }) => {
      const response = await apiClient.put<{ success: boolean; data: DBCoupon }>(`/coupon/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
};

export const useDeleteCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/coupon/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
};
