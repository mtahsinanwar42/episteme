import { api } from "@/services/api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
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
};
