import { z } from "zod";

export type UUID = string;

export interface Business {
    id: UUID;
    name: string;
    logo?: string | null;
    shortName?: string | null;
    licenseNumber?: string | null;
    businessNumber?: string | null;
    phone?: string | null;
    emailAddress?: string | null;
    website?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
    country?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Client {
    id: UUID;
    businessId: UUID;
    name: string;
    emailAddress?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
    country?: string | null;
    companyName?: string | null;
    clientId?: string | null;
    faxNumber?: string | null;
    additionalNotes?: string | null;
    rating?: number | null;
    openingBalance?: number | null;
    credit?: number | null;
    createdAt?: string;
    updatedAt?: string;
}

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const businessSchema = z.object({
    id: z.string().regex(uuidRegex, "Invalid UUID"),
    name: z.string().trim().min(2, "Name is required"),
    logo: z.string().url("Enter a valid URL").optional().or(z.literal("").transform(() => undefined)),
    shortName: z.string().optional(),
    licenseNumber: z.string().optional(),
    businessNumber: z.string().optional(),
    phone: z
        .string()
        .regex(/^[0-9+\-\s]{6,20}$/, "Enter a valid phone")
        .optional(),
    emailAddress: z.string().email("Enter a valid email").optional(),
    website: z.string().url("Enter a valid URL").optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipcode: z.string().optional(),
    country: z.string().optional()
});

export const clientSchema = z.object({
    id: z.string().regex(uuidRegex, "Invalid UUID"),
    businessId: z.string().regex(uuidRegex, "Invalid business UUID"),
    name: z.string().trim().min(2, "Name is required"),
    emailAddress: z.string().email("Enter a valid email").optional(),
    phone: z
        .string()
        .regex(/^[0-9+\-\s]{6,20}$/, "Enter a valid phone")
        .optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipcode: z.string().optional(),
    country: z.string().optional(),
    companyName: z.string().optional(),
    clientId: z.string().optional(),
    faxNumber: z.string().optional(),
    additionalNotes: z.string().optional(),
    rating: z.coerce.number().int().nonnegative().optional(),
    openingBalance: z.coerce.number().optional(),
    credit: z.coerce.number().optional()
});
