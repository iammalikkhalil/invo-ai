"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { sendOtp, resetPassword } from "@/services/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResendTimer } from "@/components/auth/ResendTimer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store";
import { useApiError } from "@/hooks/useApiError";

const schema = z.object({
    email: z.string().email(),
    otp: z.string().min(4, "Enter the 4-digit code").max(6, "Enter a valid code"),
    newPassword: z.string().min(8, "At least 8 characters")
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
    const dispatch = useAppDispatch();
    const { notifyError } = useApiError();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            otp: "",
            newPassword: ""
        }
    });

    const sendOtpMutation = useMutation({
        mutationFn: sendOtp,
        onSuccess: () => {
            dispatch(
                pushToast({
                    level: "info",
                    title: "OTP sent",
                    description: "Check your email for the reset code."
                })
            );
        },
        onError: (err) => notifyError(err, "Failed to send OTP")
    });

    const resetMutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            dispatch(
                pushToast({
                    level: "success",
                    title: "Password reset",
                    description: "You can now log in with your new password."
                })
            );
        },
        onError: (err) => notifyError(err, "Reset failed")
    });

    const onSubmit = (values: FormValues) => {
        resetMutation.mutate(values);
    };

    const onSendOtp = () => {
        const email = form.getValues("email");
        if (!email) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Enter your email",
                    description: "We need your email to send the OTP."
                })
            );
            return;
        }
        sendOtpMutation.mutate({ email });
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Send yourself an OTP and set a new password."
        >
            <form className="page-section" onSubmit={form.handleSubmit(onSubmit)}>
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
                    <label className="form-label" htmlFor="otp">
                        OTP code
                    </label>
                    <Input id="otp" type="text" inputMode="numeric" {...form.register("otp")} />
                    {form.formState.errors.otp && (
                        <p className="form-error">{form.formState.errors.otp.message}</p>
                    )}
                </div>
                <div className="form-control">
                    <label className="form-label" htmlFor="newPassword">
                        New password
                    </label>
                    <Input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        {...form.register("newPassword")}
                    />
                    {form.formState.errors.newPassword && (
                        <p className="form-error">
                            {form.formState.errors.newPassword.message}
                        </p>
                    )}
                </div>
                <ResendTimer seconds={30} />
                <div className="auth-actions">
                    <Button type="submit" disabled={resetMutation.isPending}>
                        {resetMutation.isPending ? "Resetting..." : "Reset password"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onSendOtp}
                        disabled={sendOtpMutation.isPending}
                    >
                        {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
                    </Button>
                </div>
            </form>
            <p className="auth-switch">
                Remembered your password? <Link href={"/login" as Route}>Back to login</Link>
            </p>
        </AuthLayout>
    );
}
