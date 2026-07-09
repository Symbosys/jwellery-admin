import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBBlog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  author: string;
  tags: string[];
  isActive: boolean;
  viewsCount: number;
  readTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  blogs: DBBlog[];
  pagination: {
    totalBlogs: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean | string; sort?: string; tag?: string }) => [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (idOrSlug: string) => [...blogKeys.details(), idOrSlug] as const,
};

export const useBlogsQuery = (params?: { page?: number; limit?: number; search?: string; isActive?: boolean | string; sort?: string; tag?: string }) => {
  return useQuery<BlogsResponse>({
    queryKey: blogKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: BlogsResponse }>("/blog", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useBlogQuery = (id: string) => {
  return useQuery<DBBlog>({
    queryKey: blogKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBBlog }>(`/blog/${id}`);
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useBlogBySlugQuery = (slug: string) => {
  return useQuery<DBBlog>({
    queryKey: blogKeys.detail(slug),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBBlog }>(`/blog/slug/${slug}`);
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!slug,
  });
};

export const useCreateBlogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBlog: FormData | { title: string; content: string; excerpt?: string; image?: string; author?: string; tags?: string[]; isActive?: boolean; readTime?: number }) => {
      const response = await apiClient.post<{ success: boolean; data: DBBlog }>("/blog", newBlog);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
};

export const useUpdateBlogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData | Partial<DBBlog> }) => {
      const response = await apiClient.put<{ success: boolean; data: DBBlog }>(`/blog/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
};

export const useDeleteBlogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/blog/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
};
