import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export type OfferType =
  | "FLAT_DISCOUNT"
  | "PERCENTAGE_DISCOUNT"
  | "MAKING_CHARGE_DISCOUNT"
  | "FREE_GIFT"
  | "CASHBACK"
  | "EXCHANGE"
  | "FESTIVAL"
  | "BUY_ONE_GET_ONE_FREE"
  | "GOLD_SAVINGS"
  | "LOYALTY_REWARD";

export interface DBOffer {
  id: string;
  name: string;
  description: string | null;
  offerType: OfferType;
  discountValue: number | null;
  minPurchase: number | null;
  giftDescription: string | null;
  cashbackDetails: string | null;
  exchangeDetails: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: any[];
}

export const offerKeys = {
  all: ["offers"] as const,
  list: () => [...offerKeys.all, "list"] as const,
};

export const useOffersQuery = () => {
  return useQuery<DBOffer[]>({
    queryKey: offerKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBOffer[] }>("/offer");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOffer: Partial<DBOffer>) => {
      const response = await apiClient.post<{ success: boolean; data: DBOffer }>("/offer", newOffer);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

export const useUpdateOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DBOffer> }) => {
      const response = await apiClient.put<{ success: boolean; data: DBOffer }>(`/offer/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

export const useDeleteOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/offer/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};
