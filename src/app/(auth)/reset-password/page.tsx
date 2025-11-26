"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/reset-password/request");
    }, [router]);
    return null;
}
