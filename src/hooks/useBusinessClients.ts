import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    listBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness
} from "@/services/businesses";
import {
    listClients,
    createClient,
    updateClient,
    deleteClient
} from "@/services/clients";
import type { Business, Client } from "@/types/dto/business";

export const businessKeys = {
    list: ["businesses"] as const,
    clients: (businessId: string | undefined) => ["clients", businessId] as const
};

export function useBusinesses() {
    return useQuery({ queryKey: businessKeys.list, queryFn: listBusinesses });
}

export function useClients(businessId?: string) {
    return useQuery({
        queryKey: businessKeys.clients(businessId ?? "none"),
        queryFn: () => listClients(businessId!),
        enabled: Boolean(businessId)
    });
}

export function useBusinessMutations() {
    const qc = useQueryClient();
    return {
        create: useMutation({
            mutationFn: createBusiness,
            onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.list })
        }),
        update: useMutation({
            mutationFn: (payload: Business) => updateBusiness(payload.id, payload),
            onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.list })
        }),
        remove: useMutation({
            mutationFn: deleteBusiness,
            onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.list })
        })
    };
}

export function useClientMutations() {
    const qc = useQueryClient();
    return {
        create: useMutation({
            mutationFn: createClient,
            onSuccess: (_, variables) =>
                qc.invalidateQueries({ queryKey: businessKeys.clients(variables.businessId) })
        }),
        update: useMutation({
            mutationFn: (payload: Client) => updateClient(payload.id, payload),
            onSuccess: (_, variables) =>
                qc.invalidateQueries({ queryKey: businessKeys.clients(variables.businessId) })
        }),
        remove: useMutation({
            mutationFn: (vars: { id: string; businessId: string }) => deleteClient(vars.id),
            onSuccess: (_, variables) =>
                qc.invalidateQueries({ queryKey: businessKeys.clients(variables.businessId) })
        })
    };
}
