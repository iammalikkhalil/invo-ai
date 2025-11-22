"use client";

import React from "react";
import Link from "next/link";

export function AuthLayout({
    title,
    subtitle,
    children
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="container-page page auth-page">
            <div className="card auth-card">
                <div className="card__header">
                    <p className="auth-card__label">Invotick</p>
                    <h1 className="card__title">{title}</h1>
                    {subtitle && <p className="card__description">{subtitle}</p>}
                </div>
                <div className="card__content auth-card__content">{children}</div>
            </div>
            <p className="auth-card__footer">
                Need help? <Link href="mailto:support@invotick.com">Contact support</Link>
            </p>
        </div>
    );
}
