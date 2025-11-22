import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import type { ButtonSize, ButtonVariant } from "@/types/design-system";

const variantClassMap: Record<ButtonVariant, string> = {
    primary: "",
    secondary: "btn--secondary",
    ghost: "btn--ghost",
    destructive: "btn--destructive"
};

const sizeClassMap: Record<ButtonSize, string> = {
    sm: "btn--sm",
    md: "",
    lg: "btn--lg"
};

export type ButtonProps = DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
};

export function Button({
    className,
    variant = "primary",
    size = "md",
    asChild,
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            className={clsx(
                "btn",
                variantClassMap[variant],
                sizeClassMap[size],
                className
            )}
            {...props}
        />
    );
}
