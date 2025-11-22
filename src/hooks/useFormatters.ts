import { useAppSelector } from "@/store";
import { formatCurrency, formatDate, formatNumber } from "@/utils/format";

export function useFormatters() {
    const { locales, currencies } = useAppSelector((state) => state.config);
    const locale = locales[0] ?? "en-US";
    const currency = currencies[0] ?? "USD";

    return {
        locale,
        currency,
        formatDate: (value: string | Date) => formatDate(value, locale),
        formatCurrency: (value: number) => formatCurrency(value, locale, currency),
        formatNumber: (value: number, fractionDigits = 2) =>
            formatNumber(value, locale, fractionDigits)
    };
}
