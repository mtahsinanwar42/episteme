import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";

// Get all users
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });
}
