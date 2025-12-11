import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { Client } from "@/types/dto/business";

const BASE = "/clients";

export async function listClients(businessId: string) {
    console.log("[client][list]", { businessId });
    const { data } = await api.get<ApiResponse<Client[]>>(`${BASE}?businessId=${businessId}`);
    return data.data;
}

export async function createClient(payload: Client) {
    console.log("[client][create]", payload);
    const { data } = await api.post<ApiResponse<Client>>(BASE, payload);
    return data.data;
}

export async function updateClient(id: string, payload: Client) {
    console.log("[client][update]", { id, payload });
    const { data } = await api.put<ApiResponse<Client>>(`${BASE}/${id}`, payload);
    return data.data;
}

export async function deleteClient(id: string) {
    console.log("[client][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
