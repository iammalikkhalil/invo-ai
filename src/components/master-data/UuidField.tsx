"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
    value: string;
    onChange: (val: string) => void;
    label?: string;
};

export function UuidField({ value, onChange, label = "ID (UUID)" }: Props) {
    const regenerate = () => {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            onChange(crypto.randomUUID());
        } else {
            const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
            onChange(uuid);
        }
    };

    return (
        <div className="form-control">
            <label className="form-label">{label}</label>
            <div className="uuid-field">
                <Input value={value} onChange={(e) => onChange(e.target.value)} />
                <Button type="button" variant="secondary" onClick={regenerate}>
                    Regenerate
                </Button>
            </div>
        </div>
    );
}
