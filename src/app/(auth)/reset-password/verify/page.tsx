"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store";
import { setResetOtp, getResetEmail } from "@/services/auth/localAuthState";

const schema = z.object({
    otp: z.string().min(4, "Enter the 4-digit code").max(6, "Enter a valid code")
});
type FormValues = z.infer<typeof schema>;

export default function ResetVerifyPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [email, setEmail] = useState<string | undefined>(undefined);

    useEffect(() => {
        const stored = getResetEmail();
        if (!stored) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Email missing",
                    description: "Start the reset flow again."
                })
            );
            router.push("/reset-password/request");
            return;
        }
        setEmail(stored);
    }, [dispatch, router]);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { otp: "" }
    });

    const onSubmit = (values: FormValues) => {
        setResetOtp(values.otp);
        dispatch(
            pushToast({
                level: "success",
                title: "OTP captured",
                description: "Set your new password now."
            })
        );
        router.push("/reset-password/new");
    };

    return (
        <AuthLayout title="Verify reset OTP" subtitle="Enter the OTP sent to your email.">
            <form className="page-section" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="form-control">
                    <label className="form-label">Email</label>
                    <div className="text-input" aria-readonly="true">
                        {email ?? "No email found."}
                    </div>
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
                <div className="auth-actions">
                    <Button type="submit">Continue</Button>
                </div>
            </form>
        </AuthLayout>
    );
}
