import { z } from "zod";

export type UUID = string;

export interface InventoryItem {
    id: UUID;
    name: string;
    description?: string | null;
    unitPrice: number;
    netPrice: number;
    discount?: number | null;
    discountType?: string | null;
    taxId?: UUID | null;
    unitTypeId?: UUID | null;
    itemCategoryId?: UUID | null;
    tax?: { id: UUID; name: string } | null;
    unitType?: { id: UUID; name: string } | null;
    itemCategory?: { id: UUID; name: string } | null;
    createdAt?: string;
    updatedAt?: string;
}

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const inventoryItemSchema = z.object({
    id: z.string().regex(uuidRegex, "Enter a valid UUID"),
    name: z.string().trim().min(2, "Name is required"),
    description: z.string().optional(),
    unitPrice: z.coerce.number().nonnegative("Unit price must be zero or positive"),
    netPrice: z.coerce.number().nonnegative("Net price must be zero or positive"),
    discount: z
        .union([z.coerce.number(), z.literal("").transform(() => undefined)])
        .optional(),
    discountType: z.string().optional(),
    taxId: z
        .union([z.string().regex(uuidRegex, "Invalid tax UUID"), z.literal("")])
        .optional()
        .transform((val) => (val === "" ? undefined : val)),
    unitTypeId: z
        .union([z.string().regex(uuidRegex, "Invalid unit UUID"), z.literal("")])
        .optional()
        .transform((val) => (val === "" ? undefined : val)),
    itemCategoryId: z
        .union([z.string().regex(uuidRegex, "Invalid category UUID"), z.literal("")])
        .optional()
        .transform((val) => (val === "" ? undefined : val))
});

export type InventoryFormValues = z.infer<typeof inventoryItemSchema>;
