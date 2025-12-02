import type { AuthUser } from "@/store/slices/authSlice";

const USER_STORAGE_KEY = "invotick_user";

export function saveUser(user: AuthUser) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("[userStorage][save] failed", error);
    }
}

export function loadUser(): AuthUser | undefined {
    if (typeof window === "undefined") return undefined;
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : undefined;
    } catch (error) {
        console.error("[userStorage][load] failed", error);
        return undefined;
    }
}

export function clearUser() {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
        console.error("[userStorage][clear] failed", error);
    }
}
