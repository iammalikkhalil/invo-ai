"use client";

import { clsx } from "clsx";

type AvatarVariant = "solid" | "gradient" | "outline";

function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 55%)`;
}

function initials(name: string) {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function NameAvatar({
    name,
    size = 40,
    variant = "solid",
    className
}: {
    name: string;
    size?: number;
    variant?: AvatarVariant;
    className?: string;
}) {
    const baseColor = stringToColor(name || "User");
    const bgStyle =
        variant === "gradient"
            ? {
                  backgroundImage: `linear-gradient(135deg, ${baseColor}, #fff)`
              }
            : variant === "outline"
              ? {
                    backgroundColor: "transparent",
                    color: baseColor,
                    border: `2px solid ${baseColor}`
                }
              : { backgroundColor: baseColor };

    return (
        <span
            className={clsx("name-avatar", className)}
            style={{
                width: size,
                height: size,
                ...bgStyle
            }}
            aria-label={name}
        >
            {initials(name)}
        </span>
    );
}
