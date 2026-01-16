import { config } from "@/config/config";
import type { User } from "@/models/user";

export const api = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${config.baseUrl}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },
};
