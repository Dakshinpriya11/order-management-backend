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
  password?: string; // add this so hashed password can be stored internally
}

export interface LoginResult {
  user: Omit<AuthUser, "password">; // remove password before sending to client
  token: string;
}
