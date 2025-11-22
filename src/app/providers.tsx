"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { loadTokens } from "@/services/auth/tokenStorage";
import { setTokens } from "@/store/slices/authSlice";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    // hydrate tokens on the client
    if (typeof window !== "undefined") {
        const tokens = loadTokens();
        if (tokens.access || tokens.refresh) {
            store.dispatch(
                setTokens({
                    accessToken: tokens.access,
                    refreshToken: tokens.refresh
                })
            );
        }
    }

    return (
        <ReduxProvider store={store}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </ThemeProvider>
        </ReduxProvider>
    );
}
