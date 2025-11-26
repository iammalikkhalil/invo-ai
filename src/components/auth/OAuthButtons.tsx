"use client";

import { useEffect, useState } from "react";
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
    const [googleReady, setGoogleReady] = useState(false);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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

    // Load Google Identity script
    useEffect(() => {
        if (googleReady || !googleClientId) return;
        const scriptId = "google-identity-script";
        if (document.getElementById(scriptId)) {
            setGoogleReady(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.id = scriptId;
        script.onload = () => setGoogleReady(true);
        script.onerror = () => {
            dispatch(
                pushToast({
                    level: "error",
                    title: "Google login unavailable",
                    description: "Could not load Google identity script."
                })
            );
        };
        document.body.appendChild(script);
    }, [googleReady, googleClientId, dispatch]);

    const handleGoogle = () => {
        if (!googleClientId) {
            dispatch(
                pushToast({
                    level: "error",
                    title: "Google client missing",
                    description: "Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in env."
                })
            );
            return;
        }
        if (!googleReady || !(window as any).google?.accounts?.id) {
            dispatch(
                pushToast({
                    level: "error",
                    title: "Google login not ready",
                    description: "Try again in a moment."
                })
            );
            return;
        }
        setBusyProvider("google");
        const google = (window as any).google;
        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (resp: { credential: string }) => {
                const token = resp?.credential;
                if (!token) {
                    setBusyProvider(null);
                    dispatch(
                        pushToast({
                            level: "error",
                            title: "Google login failed",
                            description: "No credential returned."
                        })
                    );
                    return;
                }
                const payload: SocialLoginRequest = {
                    socialId: token,
                    socialType: "google",
                    username: "google-user",
                    email: "google@example.com",
                    notificationToken: null
                };
                socialMutation.mutate(payload);
            }
        });
        google.accounts.id.prompt(() => {
            // prompt asynchronously
        });
    };

    const handleFacebook = () => {
        const token = prompt("Paste Facebook access token:");
        if (!token) return;
        setBusyProvider("facebook");
        socialMutation.mutate({
            socialId: token,
            socialType: "facebook",
            username: "facebook-user",
            email: "fb@example.com",
            notificationToken: null
        });
    };

    return (
        <div className="auth-oauth">
            <p className="auth-oauth__label">Or continue with</p>
            <div className="auth-oauth__actions">
                <Button
                    variant="secondary"
                    onClick={handleGoogle}
                    disabled={busyProvider !== null}
                >
                    {busyProvider === "google" ? "Signing in..." : "Google"}
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleFacebook}
                    disabled={busyProvider !== null}
                >
                    {busyProvider === "facebook" ? "Signing in..." : "Facebook"}
                </Button>
            </div>
        </div>
    );
}
