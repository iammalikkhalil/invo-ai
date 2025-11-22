"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
        >
            {isDark ? <Sun className="btn__icon" /> : <Moon className="btn__icon" />}
            <span className="theme-toggle__label">{isDark ? "Light" : "Dark"} mode</span>
        </Button>
    );
}
