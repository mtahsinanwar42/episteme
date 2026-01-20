// User service can be used for user-related operations other than auth

import type { User } from "@/models/user";
import { api } from "./api";

// Auth operations are in authService.ts
export const userService = {
  getUsers: async (): Promise<UserResponse> => {
    return api.get<UserResponse>("/users", true);
  },
};
