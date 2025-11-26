"use client";

import { useEffect, useRef, useState } from "react";
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

type GoogleCredentialResponse = {
    credential?: string;
    select_by?: string;
};

type GooglePromptNotification = {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
    isDismissedMoment: () => boolean;
    getNotDisplayedReason?: () => string;
    getSkippedReason?: () => string;
    getDismissedReason?: () => string;
    getMomentType?: () => string;
};

const logGoogleInfo = (message: string, data?: unknown) =>
    console.info("[auth][google]", message, data ?? "");

const logGoogleError = (message: string, error?: unknown) =>
    console.error("[auth][google][error]", message, error);

const decodeGoogleToken = (credential?: string) => {
    if (!credential) return null;
    try {
        const parts = credential.split(".");
        if (parts.length < 2) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        const decoded = atob(padded);
        return JSON.parse(decoded) as Record<string, unknown>;
    } catch (error) {
        logGoogleError("Failed to decode Google credential JWT", error);
        return null;
    }
};

export function OAuthButtons() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [busyProvider, setBusyProvider] = useState<Provider | null>(null);
    const [googleReady, setGoogleReady] = useState(false);
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleInitializedRef = useRef(false);

    const socialMutation = useMutation({
        mutationFn: socialLogin,
        onMutate: (payload) => {
            logGoogleInfo("Starting social login mutation", {
                provider: payload.socialType
            });
        },
        onSuccess: (data) => {
            logGoogleInfo("Social login success", {
                token: data.token,
                userId: data.userProfile?.id
            });
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
            logGoogleError("Social login failed", err);
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

    // Log mount state for quick diagnostics
    useEffect(() => {
        logGoogleInfo("OAuthButtons mounted", {
            googleClientIdPresent: Boolean(googleClientId)
        });
    }, [googleClientId]);

    // Load Google Identity script
    useEffect(() => {
        if (googleReady || !googleClientId) return;
        const scriptId = "google-identity-script";
        if (document.getElementById(scriptId)) {
            setGoogleReady(true);
            logGoogleInfo("Google script already present, marking ready");
            return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.id = scriptId;
        script.onload = () => {
            logGoogleInfo("Google identity script loaded");
            setGoogleReady(true);
        };
        script.onerror = (error) => {
            logGoogleError("Failed to load Google identity script", error);
            dispatch(
                pushToast({
                    level: "error",
                    title: "Google login unavailable",
                    description:
                        "Could not load Google identity script. Check network/CORS."
                })
            );
        };
        document.body.appendChild(script);
    }, [googleReady, googleClientId, dispatch]);

    const ensureGoogleInitialized = () => {
        if (!googleClientId) return false;
        const google = (window as any).google;
        if (!googleReady || !google?.accounts?.id) {
            logGoogleError("Google library not ready when initializing client");
            return false;
        }
        if (googleInitializedRef.current) {
            return true;
        }
        try {
            google.accounts.id.initialize({
                client_id: googleClientId,
                callback: (resp: GoogleCredentialResponse) =>
                    handleGoogleCredential(resp),
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: false // disable FedCM to reduce localhost/CORS failures
            });
            googleInitializedRef.current = true;
            logGoogleInfo("Google client initialized", {
                useFedcmForPrompt: false,
                clientIdSuffix: googleClientId.slice(-6)
            });
            return true;
        } catch (error) {
            logGoogleError("Failed to initialize Google accounts client", error);
            dispatch(
                pushToast({
                    level: "error",
                    title: "Google login unavailable",
                    description: "Could not initialize Google client."
                })
            );
            return false;
        }
    };

    const handleGoogleCredential = (resp: GoogleCredentialResponse) => {
        const token = resp?.credential;
        logGoogleInfo("Google returned credential", {
            token,
            selectBy: resp?.select_by
        });
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

        const decoded = decodeGoogleToken(token);
        logGoogleInfo("Decoded Google token payload", decoded);

        const email =
            (decoded?.email as string | undefined) ??
            `google-${(decoded?.sub as string | undefined) ?? "user"}@no-email.google`;

        const payload: SocialLoginRequest = {
            socialId: token,
            socialType: "google",
            username:
                (decoded?.name as string | undefined) ??
                (decoded?.given_name as string | undefined) ??
                email,
            email,
            notificationToken: null
        };

        // Mock login: skip backend, directly set session
        try {
            dispatch(setTokens({ accessToken: token }));
            saveTokens(token);
            dispatch(
                setUser({
                    id: Number(decoded?.sub ?? Date.now()),
                    username: payload.username,
                    email: payload.email,
                    phoneNumber: (decoded?.phone_number as string | undefined) ?? null,
                    isVerified: Boolean(decoded?.email_verified ?? true),
                    address: null,
                    country: (decoded?.locale as string | undefined) ?? null,
                    state: null,
                    city: null,
                    profilePictureUrl:
                        (decoded?.picture as string | undefined) ?? undefined
                })
            );
            dispatch(
                pushToast({
                    level: "success",
                    title: "Google login mocked",
                    description: "Signed in with Google token (no backend call)."
                })
            );
            setBusyProvider(null);
            router.push("/dashboard");
        } catch (error) {
            logGoogleError("Failed to mock login from Google token", error);
            setBusyProvider(null);
            dispatch(
                pushToast({
                    level: "error",
                    title: "Google login failed",
                    description: "Could not finalize mock login."
                })
            );
        }
    };

    const mapPromptReason = (reason?: string) => {
        if (!reason) return undefined;
        if (reason === "unregistered_origin") {
            return "Origin not allowed for this Google client. Add your full origin (protocol + host + port) to OAuth Authorized JavaScript origins.";
        }
        if (reason === "idpiframe_blocked") {
            return "Google prompt was blocked (third-party cookies/iframe). Allow cookies or test over HTTPS.";
        }
        return reason;
    };

    const handlePromptNotification = (notification: GooglePromptNotification) => {
        if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason?.();
            const message = mapPromptReason(reason);
            logGoogleError("Google prompt not displayed", { reason, message });
            setBusyProvider(null);
            dispatch(
                pushToast({
                    level: "error",
                    title: "Google login blocked",
                    description:
                        message ??
                        "Google prompt was blocked. Check third-party cookies and allowed origins."
                })
            );
            return;
        }
        if (notification.isSkippedMoment()) {
            const reason = notification.getSkippedReason?.();
            logGoogleError("Google prompt skipped", { reason });
            setBusyProvider(null);
            return;
        }
        if (notification.isDismissedMoment()) {
            const reason = notification.getDismissedReason?.();
            logGoogleInfo("Google prompt dismissed by user/browser", { reason });
            setBusyProvider(null);
            return;
        }

        logGoogleInfo("Google prompt displayed", {
            moment: notification.getMomentType?.()
        });
    };

    const handleGoogle = () => {
        logGoogleInfo("Google button clicked");
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
            logGoogleError("Google login attempted before script ready");
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
        const initialized = ensureGoogleInitialized();
        if (!initialized) {
            setBusyProvider(null);
            return;
        }
        try {
            (window as any).google.accounts.id.prompt((notification: any) =>
                handlePromptNotification(notification as GooglePromptNotification)
            );
        } catch (error) {
            logGoogleError("Google prompt threw an error", error);
            setBusyProvider(null);
            dispatch(
                pushToast({
                    level: "error",
                    title: "Google login error",
                    description: "Could not open Google prompt."
                })
            );
        }
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
