import type { AxiosError } from "axios";

export function parseApiError(error: unknown): string {
    const fallback = "Unexpected error occurred";
    if (!error) return fallback;
    const axiosErr = error as AxiosError<{ message?: string; error?: string }>;
    const data = axiosErr.response?.data;
    return (
        data?.message ||
        data?.error ||
        (axiosErr as any)?.message ||
        String(error) ||
        fallback
    );
}
