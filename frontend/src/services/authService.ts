import { api } from "@/services/api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserDetails,
  UserDetailsResponse,
} from "@/models/auth";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/auth/login", credentials, false);
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>("/auth/register", userData, false);
  },

  getLoggedInUserDetails: async (): Promise<UserDetailsResponse> => {
    return api.get<UserDetailsResponse>("/auth/me", true);
  },

  updateLoggedInUserDetails: async (
    postData: any,
  ): Promise<{ success: boolean; data: UserDetails }> => {
    return api.put<{ success: boolean; data: UserDetails }>(
      "/auth/me/details",
      postData,
      true,
    );
  },

  updatePassword: async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return api.put("/auth/me/password", { currentPassword, newPassword }, true);
  },

  forgotPassword: async (
    email: string,
  ): Promise<{ success: boolean; data: { resetToken: string } }> => {
    return api.post<{ success: boolean; data: { resetToken: string } }>(
      "/auth/forgotPassword",
      { email },
      false,
    );
  },

  resetPassword: async (
    resetToken: string,
    password: string,
  ): Promise<{ success: boolean }> => {
    return api.put<{ success: boolean }>(
      `/auth/resetPassword/${resetToken}`,
      { password },
      false,
    );
  },
};
