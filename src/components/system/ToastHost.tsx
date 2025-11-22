"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { removeToast } from "@/store/slices/uiSlice";

export function ToastHost() {
    const dispatch = useAppDispatch();
    const toasts = useAppSelector((state) => state.ui.toasts);

    if (!toasts.length) return null;

    return (
        <div className="toast-host">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast--${toast.level}`}>
                    <div className="toast__content">
                        <p className="toast__title">{toast.title}</p>
                        {toast.description && (
                            <p className="toast__description">{toast.description}</p>
                        )}
                    </div>
                    <button
                        className="toast__close"
                        aria-label="Dismiss"
                        onClick={() => dispatch(removeToast(toast.id))}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
