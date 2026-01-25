export interface UserResponse {
  data: User[];
  success: boolean;
  total: number;
  pagination?: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
}

export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: UserRole[];
  status: number;
  institution: string;
  occupation: string;
  country: string;
  linkedinUrl?: string;
  photoFilePath?: string;
  cvFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  REVIEWER = "REVIEWER",
  PUBLIC = "PUBLIC",
}

export enum UserStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
  DELETED = 9,
}

export interface UserDetailsResponse {
  data: User;
  success: boolean;
}

export interface UserDeleteResponse {
  success: boolean;
  message: string;
}
