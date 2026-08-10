// src/types/auth.ts
export type UserRole = "Admin" | "User";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}
