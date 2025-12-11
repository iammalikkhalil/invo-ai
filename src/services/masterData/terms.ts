import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { TermsDto } from "@/types/dto/masterData";

const BASE = "/terms";

export async function listTerms() {
    console.log("[terms][list] start");
    const { data } = await api.get<ApiResponse<TermsDto[]>>(BASE);
    console.log("[terms][list] ok", data?.data?.length);
    return data.data;
}

export async function createTerms(payload: TermsDto) {
    console.log("[terms][create]", payload);
    const { data } = await api.post<ApiResponse<TermsDto>>(BASE, payload);
    return data.data;
}

export async function updateTerms(id: string, payload: TermsDto) {
    console.log("[terms][update]", { id, payload });
    const { data } = await api.put<ApiResponse<TermsDto>>(`${BASE}/${id}`, payload);
    return data.data;
}

export async function deleteTerms(id: string) {
    console.log("[terms][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
