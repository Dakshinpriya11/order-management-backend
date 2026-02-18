// types/auth.types.ts

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: "USER" | "ADMIN";
  password?: string; 
}

export interface LoginResult {
  user: Omit<AuthUser, "password">; 
  token: string;
}
