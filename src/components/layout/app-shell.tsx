"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { SidebarNav } from "./sidebar-nav";
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
    const [navOpen, setNavOpen] = useState(false);

    return (
        <div className={clsx("app-shell", hideChrome && "app-shell--auth")}>
            {!hideChrome && (
                <div className={clsx("app-shell__sidebar", navOpen && "is-open")}>
                    <SidebarNav onNavigate={() => setNavOpen(false)} />
                </div>
            )}
            <div className="app-shell__body">
                {!hideChrome && (
                    <header className="app-shell__header">
                        <button
                            type="button"
                            className="sidebar-toggle"
                            aria-label="Toggle navigation"
                            onClick={() => setNavOpen((prev) => !prev)}
                        >
                            ☰
                        </button>
                        <HeaderActions />
                    </header>
                )}
                <main className="app-shell__content">{children}</main>
                {!hideChrome && (
                    <footer className="app-shell__footer">
                        <div className="container-page footer-meta">
                            <p>Invotick Web - Next.js scaffold</p>
                            <p>Connected to your Spring Boot backend via REST.</p>
                        </div>
                    </footer>
                )}
            </div>
            {!hideChrome && navOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setNavOpen(false)}
                    aria-hidden="true"
                />
            )}
            <ToastHost />
            <ModalHost />
            <LoadingOverlay />
        </div>
    );
}
