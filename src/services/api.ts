import axios from "axios";
import { store } from "@/store";
import { clearAuth } from "@/store/slices/authSlice";
import { pushToast, startLoading, stopLoading } from "@/store/slices/uiSlice";
import { authConfig } from "./auth/config";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
});

// Request interceptor for auth + loading indicator
api.interceptors.request.use((config) => {
    store.dispatch(startLoading());
    // Debug: log outgoing request
    console.log("[api][request]", {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL
    });
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response handling: stop loading, handle 401, bubble errors
api.interceptors.response.use(
    (response) => {
        store.dispatch(stopLoading());
        // Debug: log success response for quick tracing
        console.log("[api][response]", {
            url: response.config.url,
            status: response.status
        });
        return response;
    },
    async (error) => {
        store.dispatch(stopLoading());
        const status = error?.response?.status;
        const message =
            error?.response?.data?.message ??
            error?.message ??
            "Unexpected error occurred";

        // Optional refresh flow if enabled later
        if (status === 401 && authConfig.strategy === "access-refresh") {
            // Placeholder for future refresh logic
            store.dispatch(clearAuth());
        } else if (status === 401) {
            store.dispatch(clearAuth());
        }

        console.log("[api][error]", {
            url: error?.config?.url,
            status,
            message
        });

        store.dispatch(
            pushToast({
                level: "error",
                title: "Request failed",
                description: message
            })
        );
        return Promise.reject(error);
    }
);

export default api;
