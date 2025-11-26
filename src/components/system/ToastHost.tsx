"use client";


import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { removeToast } from "@/store/slices/uiSlice";

export function ToastHost() {
    const dispatch = useAppDispatch();
    const toasts = useAppSelector((state) => state.ui.toasts);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        const timerMap = timers.current;
        // Set auto-remove timers
        toasts.forEach((toast) => {
            if (timerMap.has(toast.id)) return;
            const duration = toast.durationMs ?? 3000;
            const timer = setTimeout(() => {
                dispatch(removeToast(toast.id));
                timerMap.delete(toast.id);
            }, duration);
            timerMap.set(toast.id, timer);
        });
        // Clean up timers for removed toasts
        const currentIds = new Set(toasts.map((t) => t.id));
        timerMap.forEach((timer, id) => {
            if (!currentIds.has(id)) {
                clearTimeout(timer);
                timerMap.delete(id);
            }
        });
        return () => {
            timerMap.forEach((timer) => clearTimeout(timer));
            timerMap.clear();
        };
    }, [toasts, dispatch]);

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
                    {toast.durationMs && (
                        <div
                            className="toast__progress"
                            style={{ animationDuration: `${toast.durationMs}ms` }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
