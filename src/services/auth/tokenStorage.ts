import { authConfig } from "./config";

const { storageKeys } = authConfig;

const ACCESS_COOKIE_NAME =
    process.env.NEXT_PUBLIC_ACCESS_COOKIE_NAME ?? "invotick_access_token";
const REFRESH_COOKIE_NAME =
    process.env.NEXT_PUBLIC_TOKEN_STRATEGY === "access-refresh"
        ? process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME ?? "invotick_refresh_token"
        : undefined;

export function saveTokens(access?: string, refresh?: string) {
    if (access && storageKeys.access) {
        localStorage.setItem(storageKeys.access, access);
        setCookie(ACCESS_COOKIE_NAME, access);
    }
    if (refresh && storageKeys.refresh) {
        localStorage.setItem(storageKeys.refresh, refresh);
        if (REFRESH_COOKIE_NAME) {
            setCookie(REFRESH_COOKIE_NAME, refresh);
        }
    }
}

export function loadTokens(): { access?: string; refresh?: string } {
    const access = storageKeys.access
        ? localStorage.getItem(storageKeys.access) || undefined
        : undefined;
    const refresh = storageKeys.refresh
        ? localStorage.getItem(storageKeys.refresh) || undefined
        : undefined;
    return { access, refresh };
}

export function clearStoredTokens() {
    if (storageKeys.access) localStorage.removeItem(storageKeys.access);
    if (storageKeys.refresh) localStorage.removeItem(storageKeys.refresh);
    if (storageKeys.access) clearCookie(ACCESS_COOKIE_NAME);
    if (storageKeys.refresh && REFRESH_COOKIE_NAME) clearCookie(REFRESH_COOKIE_NAME);
}

function setCookie(name: string, value: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=${value}; path=/`;
}

function clearCookie(name: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; Max-Age=0; path=/`;
}
