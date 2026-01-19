import { config } from "@/config/config";
import type {
  LoginRequest,
  LoginResponse,
  UserDetailsResponse,
} from "@/models/auth";
import Cookies from "js-cookie";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${config.baseUrl}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  getLoggedInUserDetails: async (): Promise<UserDetailsResponse> => {
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${config.baseUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user details");
    }

    return response.json();
  },
};
