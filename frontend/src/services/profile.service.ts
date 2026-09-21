import { api } from "../lib/api";
import { AuthUser, ChangePasswordPayload, UpdateProfilePayload } from "../types/auth";

export const updateProfile = async (payload: UpdateProfilePayload): Promise<AuthUser> => {
  const { data } = await api.patch<{ user: AuthUser }>("/auth/profile", payload);
  return data.user;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await api.put("/auth/change-password", payload);
};
