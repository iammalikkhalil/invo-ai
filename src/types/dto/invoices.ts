import { z } from "zod";

export type UUID = string;

export interface InvoiceLineItem {
    id: UUID;
    itemId?: UUID | null;
    description: string;
    qty: number;
    price: number;
    taxId?: UUID | null;
    discount?: number | null;
}

export interface InvoiceTotals {
    subtotal: number;
    tax: number;
    discount: number;
    grandTotal: number;
}

export interface Invoice {
    id: UUID;
    businessId: UUID;
    clientId: UUID;
    invoiceNumber: string;
    status: string;
    issueDate: string;
    dueDate: string;
    currency: string;
    lineItems: InvoiceLineItem[];
    termsId?: UUID | null;
    paymentInstructionId?: UUID | null;
    notes?: string | null;
    totals?: InvoiceTotals;
    payments?: { id: UUID; amount: number; paymentNumber?: string | null }[];
    business?: { id: UUID; name?: string | null } | null;
    client?: { id: UUID; name?: string | null } | null;
    paymentInstruction?: { id: UUID } | null;
    terms?: { id: UUID; title?: string | null } | null;
    createdAt?: string;
    updatedAt?: string;
}

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const lineItemSchema = z.object({
    id: z.string().regex(uuidRegex, "Line ID is required"),
    itemId: z
        .union([z.string().regex(uuidRegex, "Invalid item UUID"), z.literal("")])
        .optional()
        .transform((val) => (val === "" ? undefined : val)),
    description: z.string().trim().min(1, "Description is required"),
    qty: z.coerce.number().positive("Qty must be positive"),
    price: z.coerce.number().nonnegative("Price must be zero or positive"),
    taxId: z
        .union([z.string().regex(uuidRegex, "Invalid tax UUID"), z.literal("")])
        .optional()
        .transform((val) => (val === "" ? undefined : val)),
    discount: z
        .union([z.coerce.number(), z.literal("").transform(() => undefined)])
        .optional()
});

export const invoiceSchema = z.object({
    id: z.string().regex(uuidRegex, "Enter a valid UUID"),
    businessId: z.string().regex(uuidRegex, "Select a business"),
    clientId: z.string().regex(uuidRegex, "Select a client"),
    invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
    status: z.string().trim().min(1, "Status is required"),
    issueDate: z.string().trim().min(4, "Issue date is required"),
    dueDate: z.string().trim().min(4, "Due date is required"),
    currency: z.string().trim().min(1, "Currency is required"),
    termsId: z
        .union([z.string().regex(uuidRegex, "Invalid terms UUID"), z.literal("")])
        .optional()
        .transform((val) => (val === "" ? undefined : val)),
    paymentInstructionId: z
        .union([z.string().regex(uuidRegex, "Invalid payment instruction UUID"), z.literal("")])
        .optional()
        .transform((val) => (val === "" ? undefined : val)),
    notes: z.string().optional(),
    lineItems: z.array(lineItemSchema).min(1, "At least one line item is required")
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
