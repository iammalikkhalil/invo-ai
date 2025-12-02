"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { loadTokens } from "@/services/auth/tokenStorage";
import { setTokens, setUser, clearAuth } from "@/store/slices/authSlice";
import { fetchProfile } from "@/services/profile";
import { pushToast } from "@/store/slices/uiSlice";
import { clearUser, loadUser, saveUser } from "@/services/auth/userStorage";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Hydrate user from localStorage first so UI has immediate data
        const cachedUser = loadUser();
        if (cachedUser) {
            store.dispatch(setUser(cachedUser));
        }

        const tokens = loadTokens();
        if (tokens.access || tokens.refresh) {
            store.dispatch(
                setTokens({
                    accessToken: tokens.access,
                    refreshToken: tokens.refresh
                })
            );
            fetchProfile()
                .then((profile) => {
                    store.dispatch(setUser(profile));
                    saveUser(profile);
                })
                .catch((err) => {
                    console.error("[providers][profile] failed", err);
                    clearUser();
                    store.dispatch(clearAuth());
                    store.dispatch(
                        pushToast({
                            level: "error",
                            title: "Session invalid",
                            description: "Please log in again."
                        })
                    );
                });
        }
    }, []);

    return (
        <ReduxProvider store={store}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </ThemeProvider>
        </ReduxProvider>
    );
}
