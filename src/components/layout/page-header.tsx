import { clsx } from "clsx";
import type { ReactNode } from "react";

export function PageHeader({
    title,
    description,
    actions,
    className
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <div className={clsx("page-header", className)}>
            <div className="page-header__text">
                <h1 className="page-header__title">{title}</h1>
                {description && <p className="page-header__description">{description}</p>}
            </div>
            {actions && <div className="page-header__actions">{actions}</div>}
        </div>
    );
}
