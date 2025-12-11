"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

export const Textarea = forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
    return (
        <textarea
            ref={ref}
            className={clsx("textarea", className)}
            {...props}
        />
    );
});
