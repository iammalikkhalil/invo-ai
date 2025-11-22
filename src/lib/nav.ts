import type { Route } from "next";

export type NavItem = {
    title: string;
    href: Route;
    description?: string;
};

export const NAV_ITEMS: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", description: "Snapshot of revenue, invoices, and overdue items." },
    { title: "Invoices", href: "/invoices", description: "Create and send invoices synced with the mobile app." },
    { title: "Customers", href: "/customers", description: "Manage customers, contacts, and billing preferences." },
    { title: "Expenses", href: "/expenses", description: "Track expenses and receipts." },
    { title: "Reports", href: "/reports", description: "Export-ready summaries and PDF downloads." },
    { title: "Settings", href: "/settings", description: "Branding, taxes, and payment settings." }
];
