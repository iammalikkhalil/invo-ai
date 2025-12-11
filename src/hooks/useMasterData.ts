import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    listTaxes,
    createTax,
    updateTax,
    deleteTax
} from "@/services/masterData/taxes";
import {
    listUnits,
    createUnit,
    updateUnit,
    deleteUnit
} from "@/services/masterData/units";
import {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "@/services/masterData/categories";
import {
    listTerms,
    createTerms,
    updateTerms,
    deleteTerms
} from "@/services/masterData/terms";
import {
    listPaymentInstructions,
    createPaymentInstruction,
    updatePaymentInstruction,
    deletePaymentInstruction
} from "@/services/masterData/paymentInstructions";

export const masterKeys = {
    taxes: ["master-data", "taxes"] as const,
    units: ["master-data", "units"] as const,
    categories: ["master-data", "categories"] as const,
    terms: ["master-data", "terms"] as const,
    paymentInstructions: ["master-data", "payment-instructions"] as const
};

export function useTaxes() {
    return useQuery({ queryKey: masterKeys.taxes, queryFn: listTaxes });
}
export function useUnits() {
    return useQuery({ queryKey: masterKeys.units, queryFn: listUnits });
}
export function useCategories() {
    return useQuery({ queryKey: masterKeys.categories, queryFn: listCategories });
}
export function useTerms() {
    return useQuery({ queryKey: masterKeys.terms, queryFn: listTerms });
}
export function usePaymentInstructions() {
    return useQuery({
        queryKey: masterKeys.paymentInstructions,
        queryFn: listPaymentInstructions
    });
}

export function useMasterMutations() {
    const qc = useQueryClient();
    return {
        createTax: useMutation({
            mutationFn: createTax,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.taxes })
        }),
        updateTax: useMutation({
            mutationFn: updateTax,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.taxes })
        }),
        deleteTax: useMutation({
            mutationFn: deleteTax,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.taxes })
        }),
        createUnit: useMutation({
            mutationFn: createUnit,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.units })
        }),
        updateUnit: useMutation({
            mutationFn: updateUnit,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.units })
        }),
        deleteUnit: useMutation({
            mutationFn: deleteUnit,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.units })
        }),
        createCategory: useMutation({
            mutationFn: createCategory,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.categories })
        }),
        updateCategory: useMutation({
            mutationFn: updateCategory,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.categories })
        }),
        deleteCategory: useMutation({
            mutationFn: deleteCategory,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.categories })
        }),
        createTerms: useMutation({
            mutationFn: createTerms,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.terms })
        }),
        updateTerms: useMutation({
            mutationFn: updateTerms,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.terms })
        }),
        deleteTerms: useMutation({
            mutationFn: deleteTerms,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.terms })
        }),
        createPaymentInstruction: useMutation({
            mutationFn: createPaymentInstruction,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.paymentInstructions })
        }),
        updatePaymentInstruction: useMutation({
            mutationFn: updatePaymentInstruction,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.paymentInstructions })
        }),
        deletePaymentInstruction: useMutation({
            mutationFn: deletePaymentInstruction,
            onSuccess: () => qc.invalidateQueries({ queryKey: masterKeys.paymentInstructions })
        })
    };
}
