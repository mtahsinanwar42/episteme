import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

// Get all users
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: api.getUsers,
  });
}
