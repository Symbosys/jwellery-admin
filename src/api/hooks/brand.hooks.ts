import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface BrandsResponse {
  brands: DBBrand[];
  pagination: {
    totalBrands: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export const brandKeys = {
  all: ["brands"] as const,
  list: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean | string; sort?: string }) => [...brandKeys.all, "list", params] as const,
  detail: (idOrSlug: string) => [...brandKeys.all, "detail", idOrSlug] as const,
  products: (id: string, params?: { page?: number; limit?: number }) => [...brandKeys.all, "products", id, params] as const,
};

export const useBrandsQuery = (params?: { page?: number; limit?: number; search?: string; isActive?: boolean | string; sort?: string }) => {
  return useQuery<BrandsResponse>({
    queryKey: brandKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: BrandsResponse }>("/brand", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useBrandDetailQuery = (idOrSlug: string) => {
  return useQuery<DBBrand>({
    queryKey: brandKeys.detail(idOrSlug),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBBrand }>(`/brand/${idOrSlug}`);
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!idOrSlug,
  });
};

export const useBrandProductsQuery = (id: string, params?: { page?: number; limit?: number }) => {
  return useQuery<{ products: any[]; pagination: any }>({
    queryKey: brandKeys.products(id, params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: any }>(`/brand/${id}/products`, {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useCreateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBrand: { name: string; slug?: string; description?: string; logo?: string; website?: string; isActive?: boolean | string } | FormData) => {
      const response = await apiClient.post<{ success: boolean; data: DBBrand }>("/brand", newBrand);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
};

export const useUpdateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DBBrand> | FormData }) => {
      const response = await apiClient.put<{ success: boolean; data: DBBrand }>(`/brand/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
};

export const useDeleteBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/brand/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
};
