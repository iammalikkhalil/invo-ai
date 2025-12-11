import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    listInventoryItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
} from "@/services/inventoryItems";
import type { InventoryItem } from "@/types/dto/inventory";

export const inventoryKeys = {
    list: ["inventory-items"] as const
};

export function useInventoryItems() {
    return useQuery({ queryKey: inventoryKeys.list, queryFn: listInventoryItems });
}

export function useInventoryMutations() {
    const qc = useQueryClient();
    return {
        create: useMutation({
            mutationFn: createInventoryItem,
            onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.list })
        }),
        update: useMutation({
            mutationFn: (payload: InventoryItem) => updateInventoryItem(payload.id, payload),
            onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.list })
        }),
        remove: useMutation({
            mutationFn: deleteInventoryItem,
            onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.list })
        })
    };
}
