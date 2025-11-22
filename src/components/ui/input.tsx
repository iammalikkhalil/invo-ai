import { clsx } from "clsx";
import * as React from "react";

export const Input = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
    return <input ref={ref} className={clsx("text-input", className)} {...props} />;
});

Input.displayName = "Input";
