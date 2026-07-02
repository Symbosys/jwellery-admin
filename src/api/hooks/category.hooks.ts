import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBSubCategory {
  id: string;
  name: string;
  description: string;
  image: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBCategory {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  subCategories: DBSubCategory[];
  _count?: {
    products: number;
  };
}

export interface CategoriesResponse {
  categories: DBCategory[];
  pagination: {
    totalCategory: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export const categoryKeys = {
  all: ["categories"] as const,
  list: (params?: { page?: number; limit?: number }) => [...categoryKeys.all, "list", params] as const,
};

export const useCategoriesQuery = (params?: { page?: number; limit?: number }) => {
  return useQuery<CategoriesResponse>({
    queryKey: categoryKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: CategoriesResponse }>("/catogary", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCategory: { name: string; description?: string; image?: string; slug?: string } | FormData) => {
      const response = await apiClient.post<{ success: boolean; data: DBCategory }>("/catogary", newCategory);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DBCategory> | FormData }) => {
      const response = await apiClient.put<{ success: boolean; data: DBCategory }>(`/catogary/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/catogary/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

export const useCreateSubCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSubCategory: { name: string; description?: string; image?: string; categoryId: string } | FormData) => {
      const response = await apiClient.post<{ success: boolean; data: DBSubCategory }>("/suncatogary", newSubCategory);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

export const useUpdateSubCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DBSubCategory> | FormData }) => {
      const response = await apiClient.put<{ success: boolean; data: DBSubCategory }>(`/suncatogary/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

export const useDeleteSubCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/suncatogary/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};
