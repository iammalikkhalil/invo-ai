import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "@/styles/main.scss";
import { MainNav } from "@/components/layout/main-nav";
import { HeaderActions } from "@/components/layout/header-actions";
import { ToastHost } from "@/components/system/ToastHost";
import { ModalHost } from "@/components/system/ModalHost";
import { LoadingOverlay } from "@/components/system/LoadingOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Invotick Web",
    description: "Next.js frontend for the Invotick invoicing suite"
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <div className="app-shell">
                        <header className="app-shell__header">
                            <div className="app-shell__intro">
                                <MainNav />
                                <HeaderActions />
                            </div>
                        </header>
                        <main>{children}</main>
                        <footer className="app-shell__footer">
                            <div className="container-page footer-meta">
                                <p>Invotick Web - Next.js scaffold</p>
                                <p>Connected to your Spring Boot backend via REST.</p>
                            </div>
                        </footer>
                        <ToastHost />
                        <ModalHost />
                        <LoadingOverlay />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
