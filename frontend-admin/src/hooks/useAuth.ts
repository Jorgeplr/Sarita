import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get<{ user: { id: string; username: string } }>("/auth/me"),
    retry: false,
    staleTime: Infinity,
  });

  const login = useMutation({
    mutationFn: (creds: { username: string; password: string }) =>
      api.post("/auth/login", creds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth"] }),
  });

  const logout = useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => queryClient.setQueryData(["auth", "me"], null),
  });

  return {
    user: data?.user ?? null,
    isAuthed: !!data?.user,
    isLoading,
    login,
    logout,
  };
}
