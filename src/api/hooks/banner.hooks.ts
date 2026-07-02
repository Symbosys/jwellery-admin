import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface Banner {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export const bannerKeys = {
  all: ["banners"] as const,
};

export const useBannersQuery = () => {
  return useQuery<Banner[]>({
    queryKey: bannerKeys.all,
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Banner[] }>("/banner");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateBannerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      imageUrl: string;
      linkUrl: string;
      position: string;
      endDate: string;
    }) => {
      const response = await apiClient.post<{ success: boolean; data: Banner }>("/banner", {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        position: data.position,
        endDate: data.endDate,
        isActive: true,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    },
  });
};

export const useUpdateBannerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Banner> }) => {
      const response = await apiClient.put<{ success: boolean; data: Banner }>(`/banner/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    },
  });
};

export const useDeleteBannerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/banner/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    },
  });
};
