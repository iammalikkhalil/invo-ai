"use client";

import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/services/auth/logout";

export function HeaderActions() {
    const { logout } = useLogout();

    return (
        <div className="header-actions">
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={logout}>
                Log out
            </Button>
        </div>
    );
}
