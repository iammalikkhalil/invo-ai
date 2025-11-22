export type ColorToken =
    | "background"
    | "surface"
    | "surface-muted"
    | "border"
    | "border-strong"
    | "text-primary"
    | "text-secondary"
    | "text-muted"
    | "brand"
    | "brand-strong"
    | "brand-soft"
    | "success"
    | "success-soft"
    | "warning"
    | "warning-soft"
    | "danger"
    | "danger-soft"
    | "code-bg";

export type SpacingToken = "0" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export type RadiusToken = "sm" | "md" | "lg" | "xl" | "pill";

export interface ThemeTokens {
    colors: Record<ColorToken, string>;
    spacing: Record<SpacingToken, string>;
    radii: Record<RadiusToken, string>;
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export type BadgeVariant =
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "outline";
