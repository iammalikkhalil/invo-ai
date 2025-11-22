"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { socialLogin } from "@/services/auth";
import type { SocialLoginRequest } from "@/types/dto/auth";
import { useAppDispatch } from "@/store";
import { setTokens, setUser } from "@/store/slices/authSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { saveTokens } from "@/services/auth/tokenStorage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Provider = "google" | "facebook";

export function OAuthButtons() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [busyProvider, setBusyProvider] = useState<Provider | null>(null);

    const socialMutation = useMutation({
        mutationFn: socialLogin,
        onSuccess: (data) => {
            dispatch(setTokens({ accessToken: data.token }));
            saveTokens(data.token);
            dispatch(setUser(data.userProfile));
            dispatch(
                pushToast({
                    level: "success",
                    title: "Login successful",
                    description: "Welcome back!"
                })
            );
            router.push("/dashboard");
        },
        onSettled: () => setBusyProvider(null),
        onError: (err) => {
            dispatch(
                pushToast({
                    level: "error",
                    title: "Social login failed",
                    description:
                        (err as any)?.response?.data?.message ??
                        (err as Error)?.message ??
                        "Unable to complete social login."
                })
            );
        }
    });

    const handleSocial = async (provider: Provider) => {
        const token = prompt(`Paste ${provider} ID token:`);
        if (!token) return;
        setBusyProvider(provider);
        const payload: SocialLoginRequest = {
            socialId: token,
            socialType: provider,
            username: "social-user",
            email: "social@example.com",
            notificationToken: null
        };
        socialMutation.mutate(payload);
    };

    return (
        <div className="auth-oauth">
            <p className="auth-oauth__label">Or continue with</p>
            <div className="auth-oauth__actions">
                <Button
                    variant="secondary"
                    onClick={() => handleSocial("google")}
                    disabled={busyProvider !== null}
                >
                    {busyProvider === "google" ? "Signing in..." : "Google"}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => handleSocial("facebook")}
                    disabled={busyProvider !== null}
                >
                    {busyProvider === "facebook" ? "Signing in..." : "Facebook"}
                </Button>
            </div>
        </div>
    );
}
