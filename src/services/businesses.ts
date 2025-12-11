import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { Business } from "@/types/dto/business";

const BASE = "/businesses";

export async function listBusinesses() {
    console.log("[business][list]");
    const { data } = await api.get<ApiResponse<Business[]>>(BASE);
    return data.data;
}

export async function createBusiness(payload: Business) {
    console.log("[business][create]", payload);
    const { data } = await api.post<ApiResponse<Business>>(BASE, payload);
    return data.data;
}

export async function updateBusiness(id: string, payload: Business) {
    console.log("[business][update]", { id, payload });
    const { data } = await api.put<ApiResponse<Business>>(`${BASE}/${id}`, payload);
    return data.data;
}

export async function deleteBusiness(id: string) {
    console.log("[business][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
