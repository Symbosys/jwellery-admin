import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";
import { DBUser } from "./user.hooks";

export interface RequestOtpDto {
  phoneNumber: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  data: {
    phoneNumber: string;
    otp?: string;
  };
}

export interface VerifyOtpDto {
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: DBUser;
}

export interface AdminRegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const useRequestOtpMutation = () => {
  return useMutation({
    mutationFn: async (data: RequestOtpDto) => {
      const response = await apiClient.post<RequestOtpResponse>("/user/request-otp", data);
      return response.data;
    },
  });
};

export const useVerifyOtpMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VerifyOtpDto) => {
      const response = await apiClient.post<AuthResponse>("/user/verify-otp", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("user_token", data.token);
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useAdminRegisterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdminRegisterDto) => {
      const response = await apiClient.post<AuthResponse>("/user/admin/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("user_token", data.token);
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useAdminLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdminLoginDto) => {
      const response = await apiClient.post<AuthResponse>("/user/admin/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("user_token", data.token);
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<LogoutResponse>("/user/logout");
      return response.data;
    },
    onSuccess: () => {
      localStorage.removeItem("user_token");
      queryClient.clear();
    },
  });
};
