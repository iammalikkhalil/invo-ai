export type TokenStrategy = "access" | "access-refresh";

export interface TokenConfig {
    strategy: TokenStrategy;
    storageKeys: {
        access: string;
        refresh?: string;
    };
}
