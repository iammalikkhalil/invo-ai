import type { Route } from "next";

export type NavItem = {
    title: string;
    href: Route;
    description?: string;
};

export const NAV_ITEMS: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", description: "Snapshot of revenue, invoices, and overdue items." },
    { title: "Inventory", href: "/inventory-items", description: "Manage items, pricing, and master links." },
    { title: "Payments", href: "/payments", description: "Record payments and applied invoices." },
    { title: "Invoices", href: "/invoices", description: "Create and send invoices synced with the mobile app." },
    { title: "Customers", href: "/customers", description: "Manage customers, contacts, and billing preferences." },
    { title: "Expenses", href: "/expenses", description: "Track expenses and receipts." },
    { title: "Reports", href: "/reports", description: "Export-ready summaries and PDF downloads." },
    { title: "Settings", href: "/settings", description: "Branding, taxes, and payment settings." },
    { title: "Business & Clients", href: "/businesses", description: "Manage businesses and clients." },
    { title: "Master Data", href: "/master-data", description: "Manage taxes, units, categories, terms, payment instructions." }
];
