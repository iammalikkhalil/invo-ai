"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { clearAuth } from "@/store/slices/authSlice";
import { clearStoredTokens } from "./tokenStorage";
import { pushToast } from "@/store/slices/uiSlice";

export function useLogout() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const logout = () => {
        clearStoredTokens();
        dispatch(clearAuth());
        dispatch(
            pushToast({
                level: "info",
                title: "Signed out",
                description: "You have been logged out."
            })
        );
        router.push("/login");
    };

    return { logout };
}
