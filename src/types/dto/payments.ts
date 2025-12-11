import { z } from "zod";

export type UUID = string;

export interface InvoicePayment {
    id: UUID;
    invoiceId: UUID;
    amountApplied: number;
}

export interface Payment {
    id: UUID;
    businessId: UUID;
    clientId: UUID;
    paymentNumber: string;
    amount: number;
    paymentDate: string;
    paymentInstructionId?: UUID | null;
    referenceNumber?: string | null;
    notes?: string | null;
    status?: string | null;
    customerCredit?: number | null;
    invoicePayments?: InvoicePayment[];
    business?: { id: UUID; name?: string | null } | null;
    client?: { id: UUID; name?: string | null } | null;
    paymentInstruction?: { id: UUID } | null;
    createdAt?: string;
    updatedAt?: string;
}

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const invoicePaymentSchema = z.object({
    id: z.string().regex(uuidRegex, "Enter a valid UUID"),
    invoiceId: z.string().regex(uuidRegex, "Enter a valid invoice UUID"),
    amountApplied: z.coerce.number().nonnegative("Amount must be zero or positive")
});

export const paymentSchema = z.object({
    id: z.string().regex(uuidRegex, "Enter a valid UUID"),
    businessId: z.string().regex(uuidRegex, "Select a business"),
    clientId: z.string().regex(uuidRegex, "Select a client"),
    paymentNumber: z.string().trim().min(1, "Payment number is required"),
    amount: z.coerce.number().nonnegative("Amount must be zero or positive"),
    paymentDate: z.string().trim().min(4, "Payment date is required"),
    paymentInstructionId: z
        .union([z.string().regex(uuidRegex, "Invalid payment instruction UUID"), z.literal("")])
        .optional()
        .transform((val) => (val === "" ? undefined : val)),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
    customerCredit: z
        .union([z.coerce.number(), z.literal("").transform(() => undefined)])
        .optional(),
    invoicePayments: z.array(invoicePaymentSchema).optional()
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
