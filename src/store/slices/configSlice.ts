import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TokenStrategy } from "@/types/auth";

export interface UploadConfig {
    url: string;
    maxSizeMb: number;
    allowedTypes: string[];
}

export interface ConfigState {
    apiBaseUrl: string;
    tokenStrategy: TokenStrategy;
    locales: string[];
    currencies: string[];
    upload: UploadConfig;
    socialProviders: {
        googleClientId?: string;
        facebookClientId?: string;
    };
}

const parseList = (value: string | undefined, fallback: string[]): string[] =>
    value?.split(",").map((x) => x.trim()).filter(Boolean) ?? fallback;

const initialState: ConfigState = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
    tokenStrategy:
        process.env.NEXT_PUBLIC_TOKEN_STRATEGY === "access-refresh"
            ? "access-refresh"
            : "access",
    locales: parseList(process.env.NEXT_PUBLIC_LOCALES, ["en-US"]),
    currencies: parseList(process.env.NEXT_PUBLIC_CURRENCIES, ["USD"]),
    upload: {
        url: process.env.NEXT_PUBLIC_UPLOAD_URL ?? "/api/uploads",
        maxSizeMb: Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE_MB ?? 10),
        allowedTypes: parseList(
            process.env.NEXT_PUBLIC_UPLOAD_ALLOWED_TYPES,
            ["image/*", "application/pdf"]
        )
    },
    socialProviders: {
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        facebookClientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID
    }
};

const configSlice = createSlice({
    name: "config",
    initialState,
    reducers: {
        setTokenStrategy(state, action: PayloadAction<TokenStrategy>) {
            state.tokenStrategy = action.payload;
        },
        setLocales(state, action: PayloadAction<string[]>) {
            state.locales = action.payload;
        },
        setCurrencies(state, action: PayloadAction<string[]>) {
            state.currencies = action.payload;
        }
    }
});

export const { setTokenStrategy, setLocales, setCurrencies } = configSlice.actions;
export default configSlice.reducer;
