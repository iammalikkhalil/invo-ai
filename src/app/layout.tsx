import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "@/styles/main.scss";
import { AppShell } from "@/components/layout/app-shell";

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
                    <AppShell>{children}</AppShell>
                </Providers>
            </body>
        </html>
    );
}
