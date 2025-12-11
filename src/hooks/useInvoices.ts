import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    listInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice
} from "@/services/invoices";
import type { Invoice } from "@/types/dto/invoices";

export const invoiceKeys = {
    list: ["invoices"] as const
};

export function useInvoices() {
    return useQuery({ queryKey: invoiceKeys.list, queryFn: listInvoices });
}

export function useInvoiceMutations() {
    const qc = useQueryClient();
    return {
        create: useMutation({
            mutationFn: createInvoice,
            onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.list })
        }),
        update: useMutation({
            mutationFn: (payload: Invoice) => updateInvoice(payload.id, payload),
            onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.list })
        }),
        remove: useMutation({
            mutationFn: deleteInvoice,
            onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.list })
        })
    };
}
