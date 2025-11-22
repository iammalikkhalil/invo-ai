import { clsx } from "clsx";
import type { ReactNode } from "react";
import type { BadgeVariant } from "@/types/design-system";

const variantClassMap: Record<BadgeVariant, string> = {
    default: "",
    success: "badge--success",
    warning: "badge--warning",
    danger: "badge--danger",
    outline: "badge--outline"
};

export function Badge({
    variant = "default",
    children
}: {
    variant?: BadgeVariant;
    children: ReactNode;
}) {
    return (
        <span className={clsx("badge", variantClassMap[variant])}>
            {children}
        </span>
    );
}
