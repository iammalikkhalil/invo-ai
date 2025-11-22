"use client";

import React, { useEffect, useState } from "react";

export function ResendTimer({ seconds = 30 }: { seconds?: number }) {
    const [remaining, setRemaining] = useState(seconds);
    useEffect(() => {
        const timer = setInterval(() => {
            setRemaining((r) => (r > 0 ? r - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [seconds]);
    if (remaining === 0) return null;
    return <p className="resend-timer">You can resend OTP in {remaining}s</p>;
}
