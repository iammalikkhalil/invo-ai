import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { UnitDto } from "@/types/dto/masterData";

const BASE = "/master-data/units";

export async function listUnits() {
    console.log("[units][list] start");
    const { data } = await api.get<ApiResponse<UnitDto[]>>(BASE);
    console.log("[units][list] ok", data?.data?.length);
    return data.data;
}

export async function createUnit(payload: UnitDto) {
    console.log("[units][create]", payload);
    const { data } = await api.post<ApiResponse<UnitDto>>(BASE, payload);
    return data.data;
}

export async function updateUnit(currentId: string, payload: UnitDto) {
    console.log("[units][update]", { currentId, payload });
    const { data } = await api.put<ApiResponse<UnitDto>>(`${BASE}/${currentId}`, payload);
    return data.data;
}

export async function deleteUnit(id: string) {
    console.log("[units][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
