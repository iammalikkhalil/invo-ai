import type { TokenConfig } from "@/types/auth";

export const authConfig: TokenConfig = {
    strategy:
        process.env.NEXT_PUBLIC_TOKEN_STRATEGY === "access-refresh"
            ? "access-refresh"
            : "access",
    storageKeys: {
        access: "invotick_access_token",
        refresh:
            process.env.NEXT_PUBLIC_TOKEN_STRATEGY === "access-refresh"
                ? "invotick_refresh_token"
                : undefined
    }
};
