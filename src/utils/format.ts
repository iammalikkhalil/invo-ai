export function formatDate(value: string | Date, locale = "en-US"): string {
    try {
        const date = typeof value === "string" ? new Date(value) : value;
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "short",
            day: "2-digit"
        }).format(date);
    } catch {
        return String(value);
    }
}

export function formatCurrency(
    amount: number,
    locale = "en-US",
    currency = "USD"
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            maximumFractionDigits: 2
        }).format(amount);
    } catch {
        return amount.toString();
    }
}

export function formatNumber(
    value: number,
    locale = "en-US",
    fractionDigits = 2
): string {
    try {
        return new Intl.NumberFormat(locale, {
            maximumFractionDigits: fractionDigits,
            minimumFractionDigits: 0
        }).format(value);
    } catch {
        return value.toString();
    }
}
