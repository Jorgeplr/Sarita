import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useContent<T>(key: string, path: string) {
  return useQuery({
    queryKey: ["content", key],
    queryFn: () => api.get<T>(path),
  });
}
