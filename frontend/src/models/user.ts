export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  website: string;
}

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  REVIEWER = "REVIEWER",
}
