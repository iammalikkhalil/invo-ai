"use client";

import { clsx } from "clsx";
import { Button } from "@/components/ui/button";

type Props = {
    open: boolean;
    title: string;
    subtitle?: string;
    onClose: () => void;
    onSubmit: () => void;
    submitLabel?: string;
    submitting?: boolean;
    children: React.ReactNode;
};

export function MasterDrawer({
    open,
    title,
    subtitle,
    onClose,
    onSubmit,
    submitLabel = "Save",
    submitting,
    children
}: Props) {
    if (!open) return null;

    return (
        <div className={clsx("drawer", open && "is-open")}>
            <div className="drawer__panel">
                <div className="drawer__header">
                    <div>
                        <h3 className="drawer__title">{title}</h3>
                        {subtitle && <p className="drawer__subtitle">{subtitle}</p>}
                    </div>
                    <button className="drawer__close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="drawer__body">{children}</div>
                <div className="drawer__footer">
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={submitting}>
                        {submitting ? "Saving..." : submitLabel}
                    </Button>
                </div>
            </div>
            <div className="drawer__backdrop" onClick={onClose} />
        </div>
    );
}
