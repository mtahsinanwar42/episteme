import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService, type GetUsersParams } from "@/services/userService";

// Get all users with optional pagination and filtering
export function useUsers(
  params?: GetUsersParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getUsers(params),
    enabled: options?.enabled ?? true,
  });
}

// Get user details by ID
export function useUserById(userId: string | number | undefined) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId, // Only run query if userId is provided
  });
}

export function useUserDetailsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      postData,
    }: {
      userId: string | number;
      postData: any;
    }) => userService.updateUserById(userId, postData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", "search"] });
    },
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: any) => userService.createUser(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => userService.getCountries(),
  });
}
