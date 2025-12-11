import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { CategoryDto } from "@/types/dto/masterData";

const BASE = "/master-data/categories";

export async function listCategories() {
    console.log("[categories][list] start");
    const { data } = await api.get<ApiResponse<CategoryDto[]>>(BASE);
    console.log("[categories][list] ok", data?.data?.length);
    return data.data;
}

export async function createCategory(payload: CategoryDto) {
    console.log("[categories][create]", payload);
    const { data } = await api.post<ApiResponse<CategoryDto>>(BASE, payload);
    return data.data;
}

export async function updateCategory(currentId: string, payload: CategoryDto) {
    console.log("[categories][update]", { currentId, payload });
    const { data } = await api.put<ApiResponse<CategoryDto>>(`${BASE}/${currentId}`, payload);
    return data.data;
}

export async function deleteCategory(id: string) {
    console.log("[categories][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
