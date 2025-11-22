import { NextResponse, type NextRequest } from "next/server";

// Public auth routes
const AUTH_PATHS = ["/login", "/signup", "/verify-otp", "/reset-password"];
// Static/asset prefixes we skip
const ASSET_PREFIXES = ["/_next", "/favicon.ico", "/robots.txt", "/images", "/icons", "/api"];
const PUBLIC_FILE = /\.(.*)$/;

const ACCESS_COOKIE_NAME =
    process.env.NEXT_PUBLIC_ACCESS_COOKIE_NAME ?? "invotick_access_token";
const REFRESH_COOKIE_NAME =
    process.env.NEXT_PUBLIC_TOKEN_STRATEGY === "access-refresh"
        ? process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME ?? "invotick_refresh_token"
        : undefined;

function isAuthPath(pathname: string) {
    return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAsset(pathname: string) {
    if (PUBLIC_FILE.test(pathname)) return true;
    return ASSET_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (isAsset(pathname)) {
        console.log("[auth-guard] asset/static, skip:", pathname);
        return NextResponse.next();
    }

    const cookies = req.cookies;
    const access = cookies.get(ACCESS_COOKIE_NAME)?.value;
    const refresh = REFRESH_COOKIE_NAME
        ? cookies.get(REFRESH_COOKIE_NAME)?.value
        : undefined;
    const token = access || refresh;
    const authRoute = isAuthPath(pathname);

    console.log(
        "[auth-guard] check",
        JSON.stringify({
            path: pathname,
            isAuthPath: authRoute,
            hasAccess: Boolean(access),
            hasRefresh: Boolean(refresh),
            accessCookie: ACCESS_COOKIE_NAME,
            refreshCookie: REFRESH_COOKIE_NAME
        })
    );

    // Tag response with a header so you can see guard decisions in Network tab
    const next = NextResponse.next();
    next.headers.set(
        "x-auth-guard",
        JSON.stringify({
            path: pathname,
            isAuthPath: authRoute,
            hasToken: Boolean(token)
        })
    );

    if (token && authRoute) {
        console.log("[auth-guard] redirect authed -> /dashboard");
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!token && !authRoute) {
        console.log("[auth-guard] redirect unauth -> /login");
        return NextResponse.redirect(new URL("/login", req.url));
    }

    console.log("[auth-guard] allow", pathname);
    return next;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"]
};
