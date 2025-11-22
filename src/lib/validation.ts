import { z } from "zod";

export const settingsSchema = z.object({
    companyName: z.string().min(2, "Company name is required"),
    supportEmail: z.string().email("Enter a valid email"),
    currency: z.string().min(1, "Currency is required"),
    taxRate: z
        .string()
        .transform((value) => Number(value))
        .pipe(z.number().min(0).max(50)),
    locale: z.string().min(2, "Locale is required"),
    enableAutoReminders: z.boolean().default(true)
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;