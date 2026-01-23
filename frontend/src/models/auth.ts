import type { UserRole } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  institution: string;
  occupation: string;
  country: string;
  linkedinUrl: string;
  photoFilePath?: string;
  cvFilePath?: string;
  roles: string[];
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

export interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: UserRole[];
  status: number;
  institution: string;
  occupation: string;
  country: string;
  cvFilePath: string | null;
  photoFilePath: string | null;
  linkedinUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetailsResponse {
  success: boolean;
  data: UserDetails;
}
