"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/services/auth";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store";
import { useApiError } from "@/hooks/useApiError";
import {
    getResetEmail,
    getResetOtp,
    clearResetFlow
} from "@/services/auth/localAuthState";

const schema = z
    .object({
        newPassword: z.string().min(8, "At least 8 characters"),
        confirmPassword: z.string().min(8, "Confirm password")
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"]
    });

type FormValues = z.infer<typeof schema>;

export default function ResetNewPasswordPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { notifyError } = useApiError();
    const [email, setEmail] = useState<string | undefined>(undefined);
    const [otp, setOtp] = useState<string | undefined>(undefined);

    useEffect(() => {
        const storedEmail = getResetEmail();
        const storedOtp = getResetOtp();
        if (!storedEmail || !storedOtp) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Reset info missing",
                    description: "Start the reset flow again."
                })
            );
            router.push("/reset-password/request");
            return;
        }
        setEmail(storedEmail);
        setOtp(storedOtp);
    }, [dispatch, router]);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            newPassword: "",
            confirmPassword: ""
        }
    });

    const mutation = useMutation({
        mutationFn: async (vals: FormValues) => {
            if (!email || !otp) throw new Error("Reset info missing");
            return resetPassword({ email, otp, newPassword: vals.newPassword });
        },
        onSuccess: () => {
            clearResetFlow();
            dispatch(
                pushToast({
                    level: "success",
                    title: "Password reset",
                    description: "You can now log in with your new password."
                })
            );
            router.push("/login");
        },
        onError: (err) => notifyError(err, "Reset failed")
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values);
    };

    return (
        <AuthLayout title="Set new password" subtitle="Enter a strong password.">
            <form className="page-section" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="form-control">
                    <label className="form-label" htmlFor="newPassword">
                        New password
                    </label>
                    <PasswordInput
                        id="newPassword"
                        autoComplete="new-password"
                        {...form.register("newPassword")}
                    />
                    {form.formState.errors.newPassword && (
                        <p className="form-error">
                            {form.formState.errors.newPassword.message}
                        </p>
                    )}
                </div>
                <div className="form-control">
                    <label className="form-label" htmlFor="confirmPassword">
                        Confirm password
                    </label>
                    <PasswordInput
                        id="confirmPassword"
                        autoComplete="new-password"
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
                        {mutation.isPending ? "Saving..." : "Save password"}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
