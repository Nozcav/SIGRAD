import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiErrorPayload {
  message: string;
  errors?: Record<string, string[] | undefined>;
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    const data = axiosError.response?.data;

    if (data?.errors) {
      const firstFieldErrors = Object.values(data.errors).find(
        (fieldErrors) => fieldErrors && fieldErrors.length > 0
      );

      if (firstFieldErrors && firstFieldErrors.length > 0) {
        return firstFieldErrors[0] as string;
      }
    }

    if (data?.message) {
      return data.message;
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return "Ocurrio un error inesperado. Intenta nuevamente.";
};
