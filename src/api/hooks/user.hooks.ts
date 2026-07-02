import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
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
