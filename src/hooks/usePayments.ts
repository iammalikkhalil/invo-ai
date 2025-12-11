import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    listPayments,
    createPayment,
    updatePayment,
    deletePayment
} from "@/services/payments";
import type { Payment } from "@/types/dto/payments";

export const paymentKeys = {
    list: ["payments"] as const
};

export function usePayments() {
    return useQuery({ queryKey: paymentKeys.list, queryFn: listPayments });
}

export function usePaymentMutations() {
    const qc = useQueryClient();
    return {
        create: useMutation({
            mutationFn: createPayment,
            onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.list })
        }),
        update: useMutation({
            mutationFn: (payload: Payment) => updatePayment(payload.id, payload),
            onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.list })
        }),
        remove: useMutation({
            mutationFn: deletePayment,
            onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.list })
        })
    };
}
