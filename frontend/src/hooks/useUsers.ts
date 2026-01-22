import { useQuery } from "@tanstack/react-query";
import { userService, type GetUsersParams } from "@/services/userService";

// Get all users with optional pagination and filtering
export function useUsers(params?: GetUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getUsers(params),
    staleTime: 30000, // Keep data fresh for 30 seconds
  });
}

// Get user details by ID
export function useUserById(userId: string | number | undefined) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId, // Only run query if userId is provided
    staleTime: 30000, // Keep data fresh for 30 seconds
  });
}
