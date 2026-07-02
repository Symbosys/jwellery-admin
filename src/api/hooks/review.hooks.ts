import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface Review {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  status: "REPLIED" | "UNREPLIED";
}

export interface ReviewsResponse {
  reviews: Review[];
  totalReviews: number;
  pagination: {
    totalPage: number;
    currentPage: number;
    count: number;
  };
}

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (params?: Record<string, any>) => [...reviewKeys.all, "list", params] as const,
};

export const useReviewsQuery = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number | "ALL";
  status?: "ALL" | "REPLIED" | "UNREPLIED";
}) => {
  // Strip "ALL" values so they aren't sent to the backend
  const cleanParams: Record<string, any> = { ...params };
  if (cleanParams.rating === "ALL") delete cleanParams.rating;
  if (cleanParams.status === "ALL") delete cleanParams.status;

  return useQuery<ReviewsResponse>({
    queryKey: reviewKeys.list(cleanParams),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: ReviewsResponse }>("/review/all", {
        params: cleanParams,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useReplyReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const response = await apiClient.put<{ success: boolean; data: Review }>(`/review/${id}/reply`, {
        reply,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
};
