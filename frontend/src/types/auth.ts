export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  documentId: string;
  role: Role;
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  documentId: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  documentId: string;
  role: Extract<Role, "STUDENT" | "TEACHER">;
  password?: string;
}

export interface CreateUserResult {
  user: AuthUser;
  temporaryPassword: string;
}
