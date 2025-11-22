import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TokenStrategy } from "@/types/auth";

export interface AuthState {
    accessToken?: string;
    refreshToken?: string;
    strategy: TokenStrategy;
    user?: unknown;
}

const initialState: AuthState = {
    strategy:
        process.env.NEXT_PUBLIC_TOKEN_STRATEGY === "access-refresh"
            ? "access-refresh"
            : "access"
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setTokens(
            state,
            action: PayloadAction<{ accessToken?: string; refreshToken?: string }>
        ) {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        clearAuth(state) {
            state.accessToken = undefined;
            state.refreshToken = undefined;
            state.user = undefined;
        },
        setUser(state, action: PayloadAction<unknown>) {
            state.user = action.payload;
        },
        setStrategy(state, action: PayloadAction<TokenStrategy>) {
            state.strategy = action.payload;
        }
    }
});

export const { setTokens, clearAuth, setUser, setStrategy } = authSlice.actions;
export default authSlice.reducer;
