"use client";

import { usePathname } from "next/navigation";
import { MainNav } from "./main-nav";
import { HeaderActions } from "./header-actions";
import { ToastHost } from "@/components/system/ToastHost";
import { ModalHost } from "@/components/system/ModalHost";
import { LoadingOverlay } from "@/components/system/LoadingOverlay";

const AUTH_PATHS = [
    "/login",
    "/signup",
    "/verify-otp",
    "/reset-password",
    "/reset-password/request",
    "/reset-password/verify",
    "/reset-password/new"
];

function isAuthPath(pathname: string) {
    return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";
    const hideChrome = isAuthPath(pathname);

    return (
        <div className="app-shell">
            {!hideChrome && (
                <header className="app-shell__header">
                    <div className="app-shell__intro">
                        <MainNav />
                        <HeaderActions />
                    </div>
                </header>
            )}
            <main>{children}</main>
            {!hideChrome && (
                <footer className="app-shell__footer">
                    <div className="container-page footer-meta">
                        <p>Invotick Web - Next.js scaffold</p>
                        <p>Connected to your Spring Boot backend via REST.</p>
                    </div>
                </footer>
            )}
            <ToastHost />
            <ModalHost />
            <LoadingOverlay />
        </div>
    );
}
