"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { sendOtp } from "@/services/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store";
import { useApiError } from "@/hooks/useApiError";
import { setResetEmail } from "@/services/auth/localAuthState";

const schema = z.object({
    email: z.string().email("Enter a valid email")
});
type FormValues = z.infer<typeof schema>;

export default function ResetRequestPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { notifyError } = useApiError();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "" }
    });

    const mutation = useMutation({
        mutationFn: sendOtp,
        onSuccess: () => {
            const email = form.getValues("email");
            setResetEmail(email);
            dispatch(
                pushToast({
                    level: "success",
                    title: "OTP sent",
                    description: "Check your email for the reset code."
                })
            );
            router.push("/reset-password/verify");
        },
        onError: (err) => notifyError(err, "Failed to send OTP")
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate({ email: values.email });
    };

    return (
        <AuthLayout
            title="Reset password"
            subtitle="Enter your email to receive a reset OTP."
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
                <div className="auth-actions">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Sending..." : "Send OTP"}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
