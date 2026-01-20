export interface UserResponse {
  data: User[];
  success: boolean;
  total: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
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
}
