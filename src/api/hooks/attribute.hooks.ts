import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBAttributeValue {
  id: string;
  attributeId: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBAttribute {
  id: string;
  name: string;
  values: DBAttributeValue[];
  createdAt: string;
  updatedAt: string;
}

export const attributeKeys = {
  all: ["attributes"] as const,
  list: () => [...attributeKeys.all, "list"] as const,
};

export const useAttributesQuery = () => {
  return useQuery<DBAttribute[]>({
    queryKey: attributeKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBAttribute[] }>("/attribute");
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateAttributeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; values?: string[] }) => {
      const response = await apiClient.post<{ success: boolean; data: DBAttribute }>("/attribute", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.list() });
    },
  });
};

export const useAddAttributeValuesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: string[] }) => {
      const response = await apiClient.post<{ success: boolean; data: DBAttributeValue[] }>(`/attribute/${id}/values`, { values });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.list() });
    },
  });
};

export const useDeleteAttributeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/attribute/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.list() });
    },
  });
};

export const useDeleteAttributeValueMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (valueId: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/attribute/values/${valueId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.list() });
    },
  });
};
