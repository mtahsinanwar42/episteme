export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
}

export interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
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
