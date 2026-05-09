import { AxiosError } from "axios";

export const getErrorMessage = (
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (err instanceof AxiosError) {
    return err.response?.data?.message || fallback;
  }
  if (err instanceof Error) {
    return err.message || fallback;
  }
  return fallback;
};
