"use client";

import React from "react";

export function PasswordStrength({ value }: { value: string }) {
    const score = getScore(value);
    const labels = ["Weak", "Fair", "Good", "Strong"];
    return (
        <div className="password-strength">
            <div className="password-strength__bar">
                <span style={{ width: `${(score / 3) * 100}%` }} />
            </div>
            <p className="password-strength__label">{labels[score]}</p>
        </div>
    );
}

function getScore(value: string): 0 | 1 | 2 | 3 {
    let s: number = 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
    if (/[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) s++;
    return Math.min(s, 3) as 0 | 1 | 2 | 3;
}
