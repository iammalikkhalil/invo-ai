"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { sendOtp, verifyOtp } from "@/services/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResendTimer } from "@/components/auth/ResendTimer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { setTokens, setUser } from "@/store/slices/authSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { saveTokens } from "@/services/auth/tokenStorage";
import { useApiError } from "@/hooks/useApiError";

const schema = z.object({
    email: z.string().email(),
    otp: z.string().min(4, "Enter the 4-digit code").max(6, "Enter a valid code")
});

type FormValues = z.infer<typeof schema>;

export default function VerifyOtpPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { notifyError } = useApiError();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            otp: ""
        }
    });

    const verifyMutation = useMutation({
        mutationFn: verifyOtp,
        onSuccess: (data) => {
            dispatch(setTokens({ accessToken: data.token }));
            saveTokens(data.token);
            dispatch(setUser(data.userProfile));
            dispatch(
                pushToast({
                    level: "success",
                    title: "Email verified",
                    description: "You are now signed in."
                })
            );
            router.push("/dashboard");
        },
        onError: (err) => notifyError(err, "Verification failed")
    });

    const resendMutation = useMutation({
        mutationFn: sendOtp,
        onSuccess: () => {
            dispatch(
                pushToast({
                    level: "info",
                    title: "OTP sent",
                    description: "Check your email for the new code."
                })
            );
        },
        onError: (err) => notifyError(err, "Failed to resend OTP")
    });

    const onSubmit = (values: FormValues) => {
        verifyMutation.mutate(values);
    };

    const onResend = () => {
        const email = form.getValues("email");
        if (!email) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Enter your email",
                    description: "We need your email to resend the OTP."
                })
            );
            return;
        }
        resendMutation.mutate({ email });
    };

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="Enter the OTP sent to your email to finish signup."
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
                <ResendTimer seconds={30} />
                <div className="auth-actions">
                    <Button type="submit" disabled={verifyMutation.isPending}>
                        {verifyMutation.isPending ? "Verifying..." : "Verify"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onResend}
                        disabled={resendMutation.isPending}
                    >
                        {resendMutation.isPending ? "Sending..." : "Resend OTP"}
                    </Button>
                </div>
            </form>
            <p className="auth-switch">
                Already verified? <Link href={"/login" as Route}>Log in</Link>
            </p>
        </AuthLayout>
    );
}
