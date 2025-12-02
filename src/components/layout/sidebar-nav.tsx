"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { useAppSelector } from "@/store";
import { clsx } from "clsx";
import { NameAvatar } from "@/components/ui/name-avatar";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const user = useAppSelector((state) => state.auth.user as any);

    return (
        <nav className="sidebar">
            <div className="sidebar__brand">
                <span className="sidebar__logo">IV</span>
                <span className="sidebar__title">Invotick</span>
            </div>
            <ul className="sidebar__links">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                className={clsx("sidebar__link", active && "is-active")}
                            >
                                {item.title}
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <div className="sidebar__profile">
                <NameAvatar name={user?.username ?? "Guest"} />
                <div className="sidebar__profile-text">
                    <p className="sidebar__profile-name">{user?.username ?? "Guest"}</p>
                    <p className="sidebar__profile-email">{user?.email ?? "Not signed in"}</p>
                </div>
            </div>
        </nav>
    );
}
