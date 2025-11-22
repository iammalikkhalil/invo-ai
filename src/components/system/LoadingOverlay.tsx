"use client";

import React from "react";
import { useAppSelector } from "@/store";

export function LoadingOverlay() {
    const loading = useAppSelector((state) => state.ui.loadingCount > 0);
    if (!loading) return null;

    return (
        <div className="loading-overlay" role="status" aria-live="polite">
            <div className="loading-overlay__spinner" />
            <span className="loading-overlay__text">Loading...</span>
        </div>
    );
}
