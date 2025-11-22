const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

type RequestOptions = RequestInit & { searchParams?: Record<string, string | number | boolean> };

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, apiBaseUrl);
    if (options.searchParams) {
        Object.entries(options.searchParams).forEach(([key, value]) =>
            url.searchParams.set(key, String(value))
        );
    }

    const response = await fetch(url.toString(), {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {})
        },
        ...options
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export function apiBase(path: string) {
    return `${apiBaseUrl}${path}`;
}