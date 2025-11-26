"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signup } from "@/services/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store";
import { useApiError } from "@/hooks/useApiError";
import { setLastAuthEmail } from "@/services/auth/localAuthState";

const schema = z.object({
    username: z.string().min(2, "Name is required"),
    email: z.string().email(),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"]
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { notifyError } = useApiError();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: ""
        }
    });

    const mutation = useMutation({
        mutationFn: signup,
        onSuccess: () => {
            setLastAuthEmail(form.getValues("email"));
            dispatch(
                pushToast({
                    level: "success",
                    title: "Signup successful",
                    description: "Check your email for an OTP to verify your account."
                })
            );
            router.push("/verify-otp" as Route);
        },
        onError: (err) => notifyError(err, "Signup failed")
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate({
            username: values.username,
            email: values.email,
            phoneNumber: values.phoneNumber,
            password: values.password
        });
    };

    return (
        <AuthLayout
            title="Create your Invotick account"
            subtitle="Invoices, payments, and customers in one place."
        >
            <form className="page-section" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="form-control">
                    <label className="form-label" htmlFor="username">
                        Name
                    </label>
                    <Input id="username" {...form.register("username")} />
                    {form.formState.errors.username && (
                        <p className="form-error">{form.formState.errors.username.message}</p>
                    )}
                </div>
                <div className="form-control">
                    <label className="form-label" htmlFor="email">
                        Email
                    </label>
                    <Input id="email" type="email" {...form.register("email")} />
                    {form.formState.errors.email && (
                        <p className="form-error">{form.formState.errors.email.message}</p>
                    )}
                </div>
                <div className="form-control">
                    <label className="form-label" htmlFor="phone">
                        Phone (optional)
                    </label>
                    <Input id="phone" type="tel" {...form.register("phoneNumber")} />
                </div>
                <div className="form-control">
                    <label className="form-label" htmlFor="password">
                        Password
                    </label>
                    <PasswordInput
                        id="password"
                        autoComplete="new-password"
                        {...form.register("password")}
                    />
                    <PasswordStrength value={form.watch("password")} />
                    {form.formState.errors.password && (
                        <p className="form-error">{form.formState.errors.password.message}</p>
                    )}
                </div>
                <div className="form-control">
                    <label className="form-label" htmlFor="confirmPassword">
                        Confirm password
                    </label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        {...form.register("confirmPassword")}
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="form-error">
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>
                <div className="auth-actions">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Creating account..." : "Sign up"}
                    </Button>
                </div>
            </form>
            <OAuthButtons />
            <p className="auth-switch">
                Already have an account? <Link href={"/login" as Route}>Log in</Link>
            </p>
        </AuthLayout>
    );
}
