export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  documentId: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  documentId: string;
  password: string;
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
