import Link from "next/link";
import { NAV_ITEMS } from "@/lib/nav";

export function MainNav() {
    return (
        <nav className="main-nav">
            <Link href="/" className="main-nav__brand">
                <span className="main-nav__logo">IV</span>
                Invotick
            </Link>
            <div className="main-nav__links">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        className="main-nav__link"
                        href={item.href}
                    >
                        {item.title}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
