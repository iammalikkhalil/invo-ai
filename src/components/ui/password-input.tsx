"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";

export const PasswordInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
        <div className="password-input">
            <input
                ref={ref}
                type={show ? "text" : "password"}
                className={clsx("text-input password-input__field", className)}
                {...props}
            />
            <button
                type="button"
                className="password-input__toggle"
                onClick={() => setShow((prev) => !prev)}
                aria-label={show ? "Hide password" : "Show password"}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
});

PasswordInput.displayName = "PasswordInput";
