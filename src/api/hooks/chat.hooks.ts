import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiclient";

export interface DBUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface DBChatMessage {
  id: string;
  sessionId: string;
  sender: 'USER' | 'AGENT' | 'SYSTEM';
  text: string;
  createdAt: string;
}

export interface DBChatSession {
  id: string;
  userId: string | null;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  user?: DBUser | null;
  messages: DBChatMessage[];
}

export const chatKeys = {
  all: ["chat"] as const,
  sessions: () => [...chatKeys.all, "sessions"] as const,
  sessionDetails: (id: string) => [...chatKeys.sessions(), id] as const,
};

// GET /api/chat/ (Admin / Agent)
export const useAllSessionsQuery = () => {
  return useQuery<DBChatSession[]>({
    queryKey: chatKeys.sessions(),
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: DBChatSession[] }>("/chat");
      return response.data.data;
    },
    retry: 1,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
  });
};

// POST /api/chat/:id/reply (Agent -> User)
export const useSendAgentReplyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sessionId: string; text: string }) => {
      const response = await apiClient.post<{ success: boolean; data: DBChatMessage }>(
        `/chat/${payload.sessionId}/reply`,
        { text: payload.text }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
    },
  });
};

// PUT /api/chat/:id/close
export const useCloseSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.put<{ success: boolean; data: DBChatSession }>(`/chat/${sessionId}/close`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
    },
  });
};
