import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBProductVariant {
  id: string;
  productId: string;
  sku: string | null;
  price: string | number;
  discountPrice: string | number | null;
  quantity: number;
  image: string | null;
  attributeValues: {
    id: string;
    attributeId: string;
    value: string;
    attribute: {
      id: string;
      name: string;
    };
  }[];
}

export interface DBProduct {
  id: string;
  name: string;
  description: string | null;
  image: string;
  images: any; // Json (string[])
  brandId: string | null;
  brand: any;
  price: string | number;
  discountPrice: string | number | null;
  quantity: number;
  sizes: any; // Json (string[])
  colors: any; // Json (string[])
  rating: number;
  numReviews: number;
  categoryId: string;
  subCategoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subCategory?: {
    id: string;
    name: string;
  } | null;
  variants?: DBProductVariant[];
}

export interface ProductsResponse {
  products: DBProduct[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export const productKeys = {
  all: ["products"] as const,
  list: (params?: Record<string, any>) => [...productKeys.all, "list", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

export const useProductsQuery = (params?: Record<string, any>) => {
  return useQuery<ProductsResponse>({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: ProductsResponse }>("/product", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useProductDetailQuery = (id: string, enabled = true) => {
  return useQuery<DBProduct>({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBProduct }>(`/product/${id}`);
      return response.data.data;
    },
    enabled: enabled && !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: any) => {
      const response = await apiClient.post<{ success: boolean; data: DBProduct }>("/product", newProduct);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put<{ success: boolean; data: DBProduct }>(`/product/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) });
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/product/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
