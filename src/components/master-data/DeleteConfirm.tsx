"use client";

import { Button } from "@/components/ui/button";

type Props = {
    open: boolean;
    title?: string;
    description?: string;
    onCancel: () => void;
    onConfirm: () => void;
    busy?: boolean;
};

export function DeleteConfirm({
    open,
    title = "Delete item",
    description = "This will remove the item. You can recreate it later.",
    onCancel,
    onConfirm,
    busy
}: Props) {
    if (!open) return null;
    return (
        <div className="modal">
            <div className="modal__panel">
                <div className="modal__header">
                    <h3>{title}</h3>
                </div>
                <div className="modal__body">
                    <p>{description}</p>
                </div>
                <div className="modal__footer">
                    <Button variant="secondary" onClick={onCancel} disabled={busy}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={busy}>
                        {busy ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </div>
            <div className="modal__backdrop" onClick={onCancel} />
        </div>
    );
}
