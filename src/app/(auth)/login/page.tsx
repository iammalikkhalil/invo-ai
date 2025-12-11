"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/services/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { setTokens, setUser } from "@/store/slices/authSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { saveTokens } from "@/services/auth/tokenStorage";
import { useApiError } from "@/hooks/useApiError";

const schema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Enter a valid email"),
    password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { notifyError } = useApiError();

    useEffect(() => {
        console.log("[auth][login] render", {
            baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
        });
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            email: "",
            password: ""
        }
    });

    // Log on value change to see form state
    useEffect(() => {
        const subscription = form.watch((values) => {
            console.log("[auth][login] values changed", values);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const mutation = useMutation({
        mutationFn: login,
        onMutate: async (vars) => {
            console.log("[auth][login] onMutate", {
                email: vars.email,
                baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
            });
        },
        onSuccess: (data) => {
            console.log("[auth][login] onSuccess", data);
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
            // Debug toast to surface response data in UI
            dispatch(
                pushToast({
                    level: "info",
                    title: "API response",
                    description: `User: ${data.userProfile.email}`
                })
            );
            router.push("/dashboard");
        },
        onError: (err: unknown) => {
            console.log("[auth][login] onError", err);
            notifyError(err, "Login failed");
        },
        onSettled: () => {
            console.log("[auth][login] settled");
        }
    });

    const onSubmit = (values: FormValues) => {
        console.log("[auth][login] submit", values);
        dispatch(
            pushToast({
                level: "info",
                title: "Logging in",
                description: "Submitting credentials..."
            })
        );
        mutation.mutate({
            email: values.email,
            password: values.password,
            notificationToken: null
        });
    };

    const onInvalid = (errors: any) => {
        console.log("[auth][login] invalid form", errors);
        dispatch(
            pushToast({
                level: "warning",
                title: "Form incomplete",
                description: "Please fix the highlighted fields."
            })
        );
    };

    return (
        <AuthLayout
            title="Log in to Invotick"
            subtitle="Access your invoices, payments, and customers."
        >
            <form
                className="page-section"
                onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            >
                <div className="form-control">
                    <label className="form-label" htmlFor="email">
                        Email
                    </label>
                    <Input id="email" type="email" {...form.register("email")} />
                    {form.formState.errors.email && (
                        <p className="form-error">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>
                <div className="form-control">
                    <label className="form-label" htmlFor="password">
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        {...form.register("password")}
                    />
                    {form.formState.errors.password && (
                        <p className="form-error">
                            {form.formState.errors.password.message}
                        </p>
                    )}
                </div>
                <div className="auth-actions">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        onClick={() => console.log("[auth][login] button click")}
                    >
                        {mutation.isPending ? "Signing in..." : "Log in"}
                    </Button>
                    <Link className="auth-link" href={"/reset-password" as Route}>
                        Forgot password?
                    </Link>
                </div>
            </form>
            <OAuthButtons />
            <p className="auth-switch">
                New here? <Link href={"/signup" as Route}>Create an account</Link>
            </p>
        </AuthLayout>
    );
}
