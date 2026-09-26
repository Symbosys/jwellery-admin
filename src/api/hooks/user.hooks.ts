import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
  accountHolderName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: DBUser[];
  totalUsers: number;
  pagination: {
    totalPage: number;
    currentPage: number;
    count: number;
  };
}

export const userKeys = {
  all: ["users"] as const,
  list: (params?: Record<string, any>) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export const useUsersQuery = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery<UsersResponse>({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: UsersResponse }>("/user/all", {
        params,
      });
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUserQuery = (id: string, enabled = true) => {
  return useQuery<DBUser>({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBUser }>(`/user/${id}`);
      return response.data.data;
    },
    enabled: !!id && enabled,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DBUser> }) => {
      const response = await apiClient.put<{ success: boolean; data: DBUser }>(`/user/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
};
