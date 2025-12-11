"use client";

import { useEffect, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    value: string;
    onChange: (val: string) => void;
};

export function JsonFieldEditor({ value, onChange }: Props) {
    const [valid, setValid] = useState(true);
    const parsed = useMemo(() => {
        try {
            const out = JSON.parse(value || "{}");
            setValid(true);
            return out;
        } catch (_err) {
            setValid(false);
            return null;
        }
    }, [value]);

    useEffect(() => {
        // reset validity when emptied
        if (!value) setValid(true);
    }, [value]);

    return (
        <div className="json-editor">
            <div className="json-editor__label">
                <span>fieldsJson</span>
                <span className={valid ? "badge badge--ok" : "badge badge--error"}>
                    {valid ? "JSON valid" : "Invalid JSON"}
                </span>
            </div>
            <Textarea
                rows={6}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder='e.g. {"account":"123","instructions":"..."}'
            />
            <div className="json-editor__preview">
                <p>Preview</p>
                <pre>{parsed ? JSON.stringify(parsed, null, 2) : "—"}</pre>
            </div>
        </div>
    );
}
