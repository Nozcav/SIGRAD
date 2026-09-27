import { api } from "../lib/api";
import { AuthUser, CreateUserPayload, CreateUserResult, Role } from "../types/auth";

export const listUsers = async (): Promise<AuthUser[]> => {
  const { data } = await api.get<{ users: AuthUser[] }>("/admin/users");
  return data.users;
};

export const updateUserRole = async (userId: string, role: Role): Promise<AuthUser> => {
  const { data } = await api.patch<{ user: AuthUser }>(`/admin/users/${userId}/role`, { role });
  return data.user;
};

export const updateUserStatus = async (userId: string, active: boolean): Promise<AuthUser> => {
  const { data } = await api.patch<{ user: AuthUser }>(`/admin/users/${userId}/status`, {
    active,
  });
  return data.user;
};

export const createUser = async (payload: CreateUserPayload): Promise<CreateUserResult> => {
  const { data } = await api.post<CreateUserResult>("/admin/users", payload);
  return data;
};
