import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { TaxDto } from "@/types/dto/masterData";

const BASE = "/master-data/taxes";

export async function listTaxes() {
    console.log("[taxes][list] start");
    const { data } = await api.get<ApiResponse<TaxDto[]>>(BASE);
    console.log("[taxes][list] ok", data?.data?.length);
    return data.data;
}

export async function createTax(payload: TaxDto) {
    console.log("[taxes][create]", payload);
    const { data } = await api.post<ApiResponse<TaxDto>>(BASE, payload);
    return data.data;
}

export async function updateTax(currentId: string, payload: TaxDto) {
    console.log("[taxes][update]", { currentId, payload });
    const { data } = await api.put<ApiResponse<TaxDto>>(`${BASE}/${currentId}`, payload);
    return data.data;
}

export async function deleteTax(id: string) {
    console.log("[taxes][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
