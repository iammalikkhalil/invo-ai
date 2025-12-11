import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { InventoryItem } from "@/types/dto/inventory";

const BASE = "/inventory-items";

export async function listInventoryItems() {
    console.log("[inventory][list]");
    const { data } = await api.get<ApiResponse<InventoryItem[]>>(BASE);
    console.log("[inventory][list][response]", {
        length: data?.data?.length,
        sample: data?.data?.[0]
    });
    return data.data;
}

export async function createInventoryItem(payload: InventoryItem) {
    console.log("[inventory][create]", payload);
    const { data } = await api.post<ApiResponse<InventoryItem>>(BASE, payload);
    return data.data;
}

export async function updateInventoryItem(id: string, payload: InventoryItem) {
    console.log("[inventory][update]", { id, payload });
    const { data } = await api.put<ApiResponse<InventoryItem>>(`${BASE}/${id}`, payload);
    return data.data;
}

export async function deleteInventoryItem(id: string) {
    console.log("[inventory][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
